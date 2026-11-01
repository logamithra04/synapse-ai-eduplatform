from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from datetime import datetime
from .models import (
    User, StudentProfile, StudentSkill, QuizAttempt, QuizAnswer, Question,
    Course, Module, Lesson, LessonProgress, Recommendation
)

TOPIC_DOMAINS = [
    "Python Programming",
    "Mathematics for Data Science",
    "Statistics and Probability",
    "SQL and Databases",
    "Data Analysis & EDA",
    "Machine Learning",
    "Deep Learning",
    "Data Science Projects"
]

class AdaptiveLearningEngine:
    def __init__(self, db: Session):
        self.db = db

    def evaluate_diagnostic(self, user_id: int, answers: Dict[int, str]) -> Dict[str, Any]:
        """
        Calculates diagnostic assessment performance by domain,
        identifies weak/strong topics, and initializes student skill profile.
        """
        profile = self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        if not profile:
            profile = StudentProfile(user_id=user_id)
            self.db.add(profile)

        topic_stats: Dict[str, Dict[str, int]] = {
            topic: {"correct": 0, "total": 0} for topic in TOPIC_DOMAINS
        }

        total_questions = len(answers)
        correct_count = 0

        for q_id_str, user_ans in answers.items():
            q_id = int(q_id_str)
            question = self.db.query(Question).filter(Question.id == q_id).first()
            if not question:
                continue

            topic = question.topic
            if topic not in topic_stats:
                topic_stats[topic] = {"correct": 0, "total": 0}

            topic_stats[topic]["total"] += 1
            if str(user_ans).strip().lower() == str(question.correct_answer).strip().lower():
                correct_count += 1
                topic_stats[topic]["correct"] += 1

        overall_score = round((correct_count / max(1, total_questions)) * 100, 1)

        strengths = []
        weaknesses = []

        for topic, stat in topic_stats.items():
            if stat["total"] == 0:
                continue
            ratio = (stat["correct"] / stat["total"]) * 100
            mastery = round(ratio, 1)

            if ratio >= 70:
                status = "strong"
                strengths.append(topic)
            elif ratio >= 40:
                status = "moderate"
            else:
                status = "weak"
                weaknesses.append(topic)

            # Update or create StudentSkill
            skill = self.db.query(StudentSkill).filter(
                StudentSkill.user_id == user_id,
                StudentSkill.skill_name == topic
            ).first()

            if not skill:
                skill = StudentSkill(
                    user_id=user_id,
                    skill_name=topic,
                    mastery_level=mastery,
                    strength_status=status,
                    questions_attempted=stat["total"],
                    questions_correct=stat["correct"],
                    last_evaluated=datetime.utcnow()
                )
                self.db.add(skill)
            else:
                skill.mastery_level = mastery
                skill.strength_status = status
                skill.questions_attempted += stat["total"]
                skill.questions_correct += stat["correct"]
                skill.last_evaluated = datetime.utcnow()

        profile.diagnostic_completed = True
        profile.diagnostic_score = overall_score
        profile.diagnostic_strengths = strengths
        profile.diagnostic_weaknesses = weaknesses
        
        # Determine student initial level based on diagnostic score
        if overall_score >= 80:
            profile.current_level = "Advanced"
        elif overall_score >= 50:
            profile.current_level = "Intermediate"
        else:
            profile.current_level = "Beginner"

        self.db.commit()

        # Generate fresh personalized recommendations
        self.generate_recommendations(user_id)

        return {
            "score": overall_score,
            "level": profile.current_level,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "topic_breakdown": topic_stats
        }

    def update_skill_from_quiz(self, user_id: int, quiz_id: int, attempt_id: int) -> None:
        """
        Bayesian knowledge tracing update of student skills after each quiz attempt.
        """
        answers = self.db.query(QuizAnswer).filter(QuizAnswer.attempt_id == attempt_id).all()
        for ans in answers:
            q = self.db.query(Question).filter(Question.id == ans.question_id).first()
            if not q or not q.topic:
                continue

            skill = self.db.query(StudentSkill).filter(
                StudentSkill.user_id == user_id,
                StudentSkill.skill_name == q.topic
            ).first()

            if not skill:
                skill = StudentSkill(
                    user_id=user_id,
                    skill_name=q.topic,
                    mastery_level=50.0,
                    strength_status="moderate",
                    questions_attempted=0,
                    questions_correct=0
                )
                self.db.add(skill)

            skill.questions_attempted += 1
            if ans.is_correct:
                skill.questions_correct += 1
                # Increase mastery with learning rate
                weight = 1.8 if q.difficulty == "hard" else (1.2 if q.difficulty == "medium" else 0.8)
                skill.mastery_level = min(100.0, round(skill.mastery_level + (6.0 * weight), 1))
            else:
                weight = 0.8 if q.difficulty == "hard" else (1.2 if q.difficulty == "medium" else 1.8)
                skill.mastery_level = max(5.0, round(skill.mastery_level - (5.0 * weight), 1))

            # Re-evaluate status
            if skill.mastery_level >= 75:
                skill.strength_status = "strong"
            elif skill.mastery_level >= 50:
                skill.strength_status = "moderate"
            else:
                skill.strength_status = "weak"

            skill.last_evaluated = datetime.utcnow()

        self.db.commit()
        self.generate_recommendations(user_id)

    def calculate_adaptive_difficulty(self, user_id: int, topic: str = None) -> str:
        """
        Calibrates next question difficulty based on rolling accuracy.
        """
        recent_answers = (
            self.db.query(QuizAnswer)
            .join(QuizAttempt, QuizAnswer.attempt_id == QuizAttempt.id)
            .filter(QuizAttempt.user_id == user_id)
            .order_by(QuizAttempt.completed_at.desc())
            .limit(10)
            .all()
        )

        if not recent_answers or len(recent_answers) < 3:
            return "medium"

        correct_count = sum(1 for a in recent_answers if a.is_correct)
        accuracy = (correct_count / len(recent_answers)) * 100

        if accuracy >= 80:
            return "hard"
        elif accuracy <= 45:
            return "easy"
        else:
            return "medium"

    def generate_recommendations(self, user_id: int) -> List[Dict[str, Any]]:
        """
        Real recommendation engine that analyzes weak skills, uncompleted enrolled courses,
        and next-level learning paths.
        """
        # Clear existing non-dismissed recommendations
        self.db.query(Recommendation).filter(
            Recommendation.user_id == user_id,
            Recommendation.is_dismissed == False
        ).delete()

        recommendations_to_add = []

        # 1. Check Weak Topics -> generate Revision suggestions
        weak_skills = self.db.query(StudentSkill).filter(
            StudentSkill.user_id == user_id,
            StudentSkill.strength_status == "weak"
        ).all()

        for skill in weak_skills:
            # Find matching course
            matching_course = self.db.query(Course).filter(
                (Course.title.ilike(f"%{skill.skill_name}%")) | 
                (Course.summary.ilike(f"%{skill.skill_name}%"))
            ).first()

            rec = Recommendation(
                user_id=user_id,
                course_id=matching_course.id if matching_course else None,
                title=f"Focus Revision: {skill.skill_name}",
                reason=f"Your diagnostic/quiz accuracy in {skill.skill_name} is currently at {skill.mastery_level}%. Targeted review will strengthen your fundamentals.",
                priority_score=0.95,
                recommendation_type="revision"
            )
            recommendations_to_add.append(rec)

        # 2. Check Strong Topics -> Suggest Next Level or Project
        strong_skills = self.db.query(StudentSkill).filter(
            StudentSkill.user_id == user_id,
            StudentSkill.strength_status == "strong"
        ).all()

        for skill in strong_skills[:2]:
            adv_course = self.db.query(Course).filter(
                (Course.difficulty == "Advanced") | (Course.difficulty == "Intermediate"),
                (Course.title.ilike(f"%{skill.skill_name}%")) | (Course.summary.ilike(f"%{skill.skill_name}%"))
            ).first()

            if adv_course:
                rec = Recommendation(
                    user_id=user_id,
                    course_id=adv_course.id,
                    title=f"Advanced Challenge: {adv_course.title}",
                    reason=f"You demonstrated high mastery ({skill.mastery_level}%) in {skill.skill_name}. Take on advanced real-world implementations.",
                    priority_score=0.85,
                    recommendation_type="enrichment"
                )
                recommendations_to_add.append(rec)

        # 3. Next Course Along Natural Learning Progression
        enrolled_course_ids = [e.course_id for e in self.db.query(LessonProgress.course_id).filter(LessonProgress.user_id == user_id).distinct()]
        next_courses = self.db.query(Course).filter(~Course.id.in_(enrolled_course_ids) if enrolled_course_ids else True).order_by(Course.id.asc()).limit(2).all()

        for nc in next_courses:
            rec = Recommendation(
                user_id=user_id,
                course_id=nc.id,
                title=f"Next in Pathway: {nc.title}",
                reason=f"Recommended next step in your curriculum to build cohesive Data Science competencies.",
                priority_score=0.75,
                recommendation_type="next_step"
            )
            recommendations_to_add.append(rec)

        for r in recommendations_to_add:
            self.db.add(r)

        self.db.commit()

        # Return formatted recommendations
        recs = self.db.query(Recommendation).filter(
            Recommendation.user_id == user_id,
            Recommendation.is_dismissed == False
        ).order_by(Recommendation.priority_score.desc()).all()

        return [
            {
                "id": r.id,
                "course_id": r.course_id,
                "title": r.title,
                "reason": r.reason,
                "priority_score": r.priority_score,
                "recommendation_type": r.recommendation_type,
                "created_at": r.created_at.isoformat()
            }
            for r in recs
        ]
