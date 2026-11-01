import React, { useState } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, 
  CheckCircle, Clock, Sparkles, BookOpen, ChevronRight, Award,
  Tv, Film, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Chapter {
  title: string;
  time: string; // e.g. "02:15"
  seconds: number;
}

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  courseTitle?: string;
  durationMins?: number;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl = "https://www.youtube.com/embed/aircAruvnKk",
  title,
  courseTitle,
  durationMins = 15,
  onComplete,
  isCompleted = false,
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<'chapters' | 'notes'>('chapters');
  const [currentSecond, setCurrentSecond] = useState<number>(0);

  // Parse embed URL properly
  const formatEmbedUrl = (url: string, startSec: number = 0) => {
    let cleanUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      const vId = url.split('v=')[1]?.split('&')[0];
      cleanUrl = `https://www.youtube.com/embed/${vId}`;
    } else if (url.includes('youtu.be/')) {
      const vId = url.split('youtu.be/')[1]?.split('?')[0];
      cleanUrl = `https://www.youtube.com/embed/${vId}`;
    }

    const separator = cleanUrl.includes('?') ? '&' : '?';
    return `${cleanUrl}${separator}autoplay=0&rel=0&modestbranding=1&start=${startSec}`;
  };

  const [embedSrc, setEmbedSrc] = useState<string>(() => formatEmbedUrl(videoUrl, 0));

  const chapters: Chapter[] = [
    { title: "Introduction & Context Architecture", time: "00:00", seconds: 0 },
    { title: "Theoretical Foundations & Math Intuition", time: "03:15", seconds: 195 },
    { title: "Live Pipeline Code Walkthrough", time: "07:30", seconds: 450 },
    { title: "Performance Diagnostics & Common Pitfalls", time: "11:45", seconds: 705 },
    { title: "Summary & Practical Action Items", time: "14:10", seconds: 850 },
  ];

  const handleSeekChapter = (seconds: number) => {
    setCurrentSecond(seconds);
    setEmbedSrc(formatEmbedUrl(videoUrl, seconds));
  };

  const handleTriggerComplete = () => {
    if (onComplete) {
      onComplete();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
      {/* Video Header Bar */}
      <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 truncate">
          <span className="p-1 rounded bg-indigo-600/30 text-indigo-400 font-mono">
            <Film className="w-3.5 h-3.5" />
          </span>
          <span className="text-slate-400 font-medium truncate">{courseTitle || 'Interactive Lecture'}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-200 font-semibold truncate">{title}</span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center text-slate-400">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {durationMins} mins
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
            1080p Full HD
          </span>
        </div>
      </div>

      {/* Main Video Viewport (16:9) */}
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      {/* Control Bar & Chapter Navigation */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Speed Controls */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Playback Speed:</span>
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                playbackSpeed === speed
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Completion Action */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerComplete}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              isCompleted
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-white'}`} />
            <span>{isCompleted ? 'Lecture Completed ✓' : 'Mark Watched & Completed'}</span>
          </button>
        </div>
      </div>

      {/* Chapters & Synchronized Notes Tabs */}
      <div className="border-t border-slate-800 bg-slate-900/90 p-4">
        <div className="flex space-x-4 border-b border-slate-800 pb-2 mb-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('chapters')}
            className={`pb-1.5 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'chapters'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Chapters ({chapters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-1.5 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'notes'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lecture Key Takeaways</span>
          </button>
        </div>

        {activeTab === 'chapters' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {chapters.map((chap, i) => (
              <button
                key={i}
                onClick={() => handleSeekChapter(chap.seconds)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all group ${
                  currentSecond === chap.seconds
                    ? 'bg-indigo-900/30 border-indigo-500 text-white'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="truncate mr-2">
                  <span className="block font-medium truncate group-hover:text-indigo-300">
                    {chap.title}
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-indigo-400 shrink-0 border border-slate-700">
                  {chap.time}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <p>
              • <strong>Core Analytical Principle:</strong> Separate feature transformation from model fitting to eliminate data leakage across evaluation folds.
            </p>
            <p>
              • <strong>Pipeline Design:</strong> Standardize continuous variables with <code>StandardScaler()</code> and encode categorical variables before model ingestion.
            </p>
            <p>
              • <strong>Diagnostic Protocol:</strong> Inspect error residuals and evaluate out-of-fold generalization before fine-tuning hyperparameters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
