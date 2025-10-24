import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, FileText, ClipboardList, Play, Pause, Volume2, Maximize, Lock, ChevronDown, VolumeX, PlayIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { getCourseById, getCourseLessons, getCourseExams, getCourseAssignments } from '@/services/coursesService';
import { type Course, type Lesson } from '@/services/coursesService';

interface Exam {
  _id: string;
  courseId: string | null;
  lessonId: string | null;
  title: string;
  date: string;
  timeLimitMin: number;
  totalMarks: number;
  type: 'course' | 'general';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Assignment {
  _id: string;
  courseId: string | null;
  lessonId: string | null;
  title: string;
  date: string;
  timeLimitMin: number;
  totalMarks: number;
  type: 'course' | 'general';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VideoState {
  playing: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playbackRate: number; // Added playback rate
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoStates, setVideoStates] = useState<Record<string, VideoState>>({});
  const [activeLessonId, setActiveLessonId] = useState<string>(''); // Track active lesson
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  const playerRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Load course
      const courseData = await getCourseById(id);
      setCourse(courseData);
      
      // Load lessons
      const lessonsData = await getCourseLessons(id);
      setLessons(lessonsData);
      
      // Load exams
      const examsData = await getCourseExams(id);
      setExams(examsData);
      
      // Load assignments
      const assignmentsData = await getCourseAssignments(id);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get exams for a specific lesson
  const getExamsForLesson = (lessonId: string) => {
    return exams.filter(exam => exam.lessonId === lessonId);
  };

  // Helper function to get assignments for a specific lesson
  const getAssignmentsForLesson = (lessonId: string) => {
    return assignments.filter(assignment => assignment.lessonId === lessonId);
  };

  // Initialize video state for a lesson
  const initVideoState = (lessonId: string) => {
    if (!videoStates[lessonId]) {
      setVideoStates(prev => ({
        ...prev,
        [lessonId]: {
          playing: false,
          volume: 100,
          currentTime: 0,
          duration: 0, // Will be updated when we get the actual duration from YouTube
          playbackRate: 1
        }
      }));
    }
  };

  // Function to toggle play/pause for a specific lesson
  const togglePlay = (lessonId: string) => {
    initVideoState(lessonId);
    const isPlaying = !videoStates[lessonId]?.playing;
    
    setVideoStates(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        playing: isPlaying
      }
    }));
    
    // Send play/pause command to YouTube player
    if (isPlaying) {
      sendYouTubeCommand(lessonId, 'playVideo');
    } else {
      sendYouTubeCommand(lessonId, 'pauseVideo');
    }
  };

  // Function to handle volume change for a specific lesson
  const handleVolumeChange = (lessonId: string, newVolume: number) => {
    initVideoState(lessonId);
    const volume = Math.max(0, Math.min(100, newVolume));
    
    setVideoStates(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        volume: volume
      }
    }));
    
    // Set volume on YouTube player
    sendYouTubeCommand(lessonId, 'setVolume', volume);
  };

  // Function to set specific volume level
  const setVolumeLevel = (lessonId: string, level: number) => {
    handleVolumeChange(lessonId, level);
  };

  // Function to toggle mute
  const toggleMute = (lessonId: string) => {
    const currentVolume = videoStates[lessonId]?.volume || 0;
    if (currentVolume > 0) {
      setVideoStates(prev => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          volume: 0
        }
      }));
      sendYouTubeCommand(lessonId, 'setVolume', 0);
    } else {
      setVideoStates(prev => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          volume: 100
        }
      }));
      sendYouTubeCommand(lessonId, 'setVolume', 100);
    }
  };

  // Function to set playback speed
  const setPlaybackRate = (lessonId: string, rate: number) => {
    initVideoState(lessonId);
    
    setVideoStates(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        playbackRate: rate
      }
    }));
    
    // Set playback rate on YouTube player
    sendYouTubeCommand(lessonId, 'setPlaybackRate', rate);
  };

  // Function to seek to a specific time in the video
  const seekTo = (lessonId: string, time: number) => {
    initVideoState(lessonId);
    
    setVideoStates(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        currentTime: time
      }
    }));
    
    // Seek to time in YouTube player
    sendYouTubeCommand(lessonId, 'seekTo', time);
  };

  // Function to toggle fullscreen for a specific lesson
  const toggleFullscreen = (lessonId: string) => {
    const videoContainer = document.getElementById(`video-container-${lessonId}`);
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Function to send commands to YouTube player
  const sendYouTubeCommand = (lessonId: string, command: string, value?: any) => {
    const iframe = iframeRefs.current[lessonId];
    if (!iframe || !iframe.contentWindow) return;
    
    // Post message to YouTube iframe
    iframe.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func: command,
      args: value !== undefined ? [value] : []
    }), 'https://www.youtube.com');
  };

  // Function to get video duration from YouTube player
  const getVideoDuration = (lessonId: string) => {
    sendYouTubeCommand(lessonId, 'getDuration');
  };

  // Function to get current time from YouTube player
  const getCurrentTime = (lessonId: string) => {
    sendYouTubeCommand(lessonId, 'getCurrentTime');
  };

  // Function to format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Refs for drag functionality
  const progressRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isDragging = useRef(false);
  const draggingLessonId = useRef<string | null>(null);

  // Function to handle progress bar click
  const handleProgressClick = (lessonId: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRefs.current[lessonId]) return;
    
    const progressBar = progressRefs.current[lessonId]!;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * (videoStates[lessonId]?.duration || 600);
    
    seekTo(lessonId, time);
  };

  // Function to start dragging
  const startDrag = (lessonId: string) => {
    isDragging.current = true;
    draggingLessonId.current = lessonId;
  };

  // Function to stop dragging
  const stopDrag = () => {
    isDragging.current = false;
    draggingLessonId.current = null;
  };

  // Function to handle dragging
  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !draggingLessonId.current || !progressRefs.current[draggingLessonId.current]) return;
    
    const lessonId = draggingLessonId.current;
    const progressBar = progressRefs.current[lessonId]!;
    const rect = progressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = pos * (videoStates[lessonId]?.duration || 600);
    
    seekTo(lessonId, time);
  }, [videoStates]);

  // Add event listeners for drag functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e);
    };

    const handleMouseUp = () => {
      stopDrag();
    };

    if (isDragging.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleDrag]);

  useEffect(() => {
    loadData();
  }, [id]);

  // Effect to update video time periodically
  useEffect(() => {
    // Listen for messages from YouTube player
    const handleYouTubeMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        
        // Handle different types of YouTube events
        if (data.event === 'onReady') {
          // Player is ready, get initial duration
          Object.keys(iframeRefs.current).forEach(lessonId => {
            const iframe = iframeRefs.current[lessonId];
            if (iframe) {
              getVideoDuration(lessonId);
            }
          });
        } else if (data.event === 'onStateChange') {
          // Update playing state based on player state
          Object.keys(iframeRefs.current).forEach(lessonId => {
            const iframe = iframeRefs.current[lessonId];
            if (iframe) {
              setVideoStates(prev => ({
                ...prev,
                [lessonId]: {
                  ...prev[lessonId],
                  playing: data.info === 1 // 1 means playing
                }
              }));
            }
          });
        } else if (data.info) {
          // Handle info delivery
          Object.keys(iframeRefs.current).forEach(lessonId => {
            const iframe = iframeRefs.current[lessonId];
            if (iframe) {
              if (data.info.duration) {
                // Update duration
                setVideoStates(prev => ({
                  ...prev,
                  [lessonId]: {
                    ...prev[lessonId],
                    duration: data.info.duration
                  }
                }));
              }
              if (data.info.currentTime !== undefined) {
                // Update current time
                setVideoStates(prev => ({
                  ...prev,
                  [lessonId]: {
                    ...prev[lessonId],
                    currentTime: data.info.currentTime
                  }
                }));
              }
            }
          });
        }
      } catch (error) {
        console.error('Error parsing YouTube message:', error);
      }
    };

    window.addEventListener('message', handleYouTubeMessage);
    
    // Request duration for all videos periodically until we get responses
    const requestDurations = () => {
      Object.keys(iframeRefs.current).forEach(lessonId => {
        if (iframeRefs.current[lessonId]) {
          // Only request if we don't have duration yet
          if (!videoStates[lessonId] || !videoStates[lessonId].duration) {
            getVideoDuration(lessonId);
          }
        }
      });
    };

    // Initial request
    const initTimeout = setTimeout(requestDurations, 1000);
    
    // Periodic requests until we get all durations
    const durationInterval = setInterval(() => {
      let allHaveDuration = true;
      Object.keys(iframeRefs.current).forEach(lessonId => {
        if (!videoStates[lessonId] || !videoStates[lessonId].duration) {
          allHaveDuration = false;
        }
      });
      
      if (!allHaveDuration) {
        requestDurations();
      }
    }, 3000);

    const interval = setInterval(() => {
      // In a real implementation, we would get current time from YouTube player
      // For now, we'll simulate time updates for demonstration
      setVideoStates(prev => {
        const updated = {...prev};
        Object.keys(updated).forEach(lessonId => {
          if (updated[lessonId].playing) {
            // Only simulate if we don't have real YouTube integration
            // If we have a real duration, don't simulate
            if (!updated[lessonId].duration || updated[lessonId].duration === 0) {
              updated[lessonId] = {
                ...updated[lessonId],
                currentTime: Math.min(
                  updated[lessonId].currentTime + 1, 
                  updated[lessonId].duration || 600
                )
              };
            }
          }
        });
        return updated;
      });
    }, 1000);

    return () => {
      window.removeEventListener('message', handleYouTubeMessage);
      clearTimeout(initTimeout);
      clearInterval(durationInterval);
      clearInterval(interval);
    };
  }, [videoStates]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeLessonId) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay(activeLessonId);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          const newTimeBackward = Math.max(0, (videoStates[activeLessonId]?.currentTime || 0) - 10);
          seekTo(activeLessonId, newTimeBackward);
          break;
        case 'ArrowRight':
          e.preventDefault();
          const newTimeForward = Math.min(
            videoStates[activeLessonId]?.duration || 600, 
            (videoStates[activeLessonId]?.currentTime || 0) + 10
          );
          seekTo(activeLessonId, newTimeForward);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const newVolumeUp = Math.min(100, (videoStates[activeLessonId]?.volume || 0) + 10);
          setVolumeLevel(activeLessonId, newVolumeUp);
          break;
        case 'ArrowDown':
          e.preventDefault();
          const newVolumeDown = Math.max(0, (videoStates[activeLessonId]?.volume || 0) - 10);
          setVolumeLevel(activeLessonId, newVolumeDown);
          break;
        case 'f':
        case 'ب':
        case 'F':
          e.preventDefault();
          toggleFullscreen(activeLessonId);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeLessonId, videoStates]);

  if (loading) {
    return (
      <AppShell>
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">الكورس غير موجود</p>
          <Button onClick={() => navigate('/courses')}>العودة للكورسات</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Course Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-48 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={course.image}
                alt={`صورة كورس ${course.title}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div className="text-sm text-muted-foreground">{course.year}</div>
              <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
              <p className="text-muted-foreground">{course.fullDescription}</p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{lessons.length} دروس</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{exams.length} امتحانات</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        {/* Tabs */}
        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="lessons" className="gap-2">
              <BookOpen className="w-4 h-4" />
              الدروس
            </TabsTrigger>
            <TabsTrigger value="exams" className="gap-2">
              <FileText className="w-4 h-4" />
              الامتحانات
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              الواجبات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-3 mt-6">
            <Accordion type="single" collapsible className="w-full">
              {lessons.map((lesson, index) => (
                <AccordionItem key={lesson._id} value={`lesson-${lesson._id}`} className="bg-card border border-border rounded-xl mb-4 overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">
                        {index + 1}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                        <p className="text-sm text-muted-foreground">{lesson.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{lesson.duration} دقيقة</span>
                          {lesson.isLocked ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" />
                              مقفل
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              <Play className="w-3 h-3" />
                              متاح
                            </span>
                          )}
                        </div>
                      </div>
                      {lesson.isLocked ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-success">
                          <Play className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {/* Video Frame or Locked Message */}
                      {lesson.isLocked ? (
                        <div className="bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center p-6 text-center">
                          <div>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                              <Lock className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">الدرس مقفل</h3>
                            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                              يرجى إكمال الواجبات والامتحانات الخاصة بالدروس السابقة لفتح هذا الدرس
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                              <div className="inline-flex items-center gap-2 bg-background px-4 py-2 rounded-full border">
                                <ClipboardList className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">الواجبات: 0/0 مكتمل</span>
                              </div>
                              <div className="inline-flex items-center gap-2 bg-background px-4 py-2 rounded-full border">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">الامتحانات: 0/0 مكتمل</span>
                              </div>
                            </div>
                            <div className="mt-4 text-xs text-muted-foreground">
                              <p>أكمل الدرس السابق لفتح هذا المحتوى</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div 
                            className="bg-muted rounded-lg overflow-hidden aspect-video relative" 
                            id={`video-container-${lesson._id}`}
                          >
                            {/* Video overlay to prevent downloading and hide controls */}
                            <div className="absolute inset-0 z-10"></div>
                            <iframe
                              ref={(el) => (iframeRefs.current[lesson._id] = el)}
                              src={`https://www.youtube.com/embed/s7kLbthGnLE?si=EnHga186vAHY-cHw&controls=0&modestbranding=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&autoplay=0&enablejsapi=1&origin=${window.location.origin}`}
                              title="فيديو الدرس"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                              id={`video-${lesson._id}`}
                              onLoad={() => {
                                // Initialize video state when iframe loads
                                initVideoState(lesson._id);
                              }}
                            ></iframe>
                          </div>
                          
                          {/* Custom Video Controls */}
                          <div className="bg-card border border-border rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 flex-shrink-0"
                                onClick={() => {
                                  setActiveLessonId(lesson._id);
                                  togglePlay(lesson._id);
                                }}
                              >
                                {videoStates[lesson._id]?.playing ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-xs text-muted-foreground flex-shrink-0 w-10">
                                  {formatTime(videoStates[lesson._id]?.currentTime || 0)}
                                </span>
                                {/* Backward 10 seconds button */}
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 px-2 text-xs font-medium"
                                  onClick={() => {
                                    setActiveLessonId(lesson._id);
                                    const newTime = Math.max(0, (videoStates[lesson._id]?.currentTime || 0) - 10);
                                    seekTo(lesson._id, newTime);
                                  }}
                                >
                                  -10s
                                </Button>
                                <div 
                                  className="flex-1 h-2 bg-muted rounded-full overflow-hidden cursor-pointer relative min-w-[80px] sm:min-w-[120px]"
                                  onClick={(e) => {
                                    setActiveLessonId(lesson._id);
                                    const duration = videoStates[lesson._id]?.duration || 600;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pos = (e.clientX - rect.left) / rect.width;
                                    const time = pos * duration;
                                    seekTo(lesson._id, time);
                                  }}
                                  onTouchStart={(e) => {
                                    e.preventDefault();
                                    setActiveLessonId(lesson._id);
                                    const duration = videoStates[lesson._id]?.duration || 600;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pos = (e.touches[0].clientX - rect.left) / rect.width;
                                    const time = pos * duration;
                                    seekTo(lesson._id, time);
                                  }}
                                >
                                  <div 
                                    className="h-full bg-primary absolute top-0 left-0"
                                    style={{ 
                                      width: `${((videoStates[lesson._id]?.currentTime || 0) / (videoStates[lesson._id]?.duration || 600)) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                                {/* Forward 10 seconds button */}
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 px-2 text-xs font-medium"
                                  onClick={() => {
                                    setActiveLessonId(lesson._id);
                                    const duration = videoStates[lesson._id]?.duration || 600;
                                    const newTime = Math.min(
                                      duration, 
                                      (videoStates[lesson._id]?.currentTime || 0) + 10
                                    );
                                    seekTo(lesson._id, newTime);
                                  }}
                                >
                                  +10s
                                </Button>
                                <span className="text-xs text-muted-foreground flex-shrink-0 w-10 text-right">
                                  {videoStates[lesson._id]?.duration && videoStates[lesson._id]?.duration > 0 
                                    ? formatTime(videoStates[lesson._id]?.duration) 
                                    : '--:--'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Volume Control with Slider */}
                              <div className="flex items-center gap-2">
                                {/* Mute button for all screen sizes */}
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 flex-shrink-0"
                                  onClick={() => {
                                    setActiveLessonId(lesson._id);
                                    toggleMute(lesson._id);
                                  }}
                                >
                                  {videoStates[lesson._id]?.volume > 0 ? (
                                    <Volume2 className="h-4 w-4" />
                                  ) : (
                                    <VolumeX className="h-4 w-4" />
                                  )}
                                </Button>
                                {/* Volume slider for larger screens */}
                                <div className="w-12 sm:w-16 md:w-20 h-2 bg-muted rounded-full overflow-hidden cursor-pointer relative hidden sm:block"
                                  onClick={(e) => {
                                    setActiveLessonId(lesson._id);
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pos = (e.clientX - rect.left) / rect.width;
                                    const volume = Math.max(0, Math.min(100, pos * 100));
                                    setVolumeLevel(lesson._id, volume);
                                  }}
                                >
                                  <div 
                                    className="h-full bg-primary absolute top-0 left-0"
                                    style={{ 
                                      width: `${videoStates[lesson._id]?.volume || 0}%` 
                                    }}
                                  ></div>
                                </div>
                                {/* Volume dropdown for mobile screens */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild className="sm:hidden">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Volume2 className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 bg-white">
                                    <div className="p-2">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden cursor-pointer relative"
                                          onClick={(e) => {
                                            setActiveLessonId(lesson._id);
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const pos = (e.clientX - rect.left) / rect.width;
                                            const volume = Math.max(0, Math.min(100, pos * 100));
                                            setVolumeLevel(lesson._id, volume);
                                          }}
                                        >
                                          <div 
                                            className="h-full bg-primary absolute top-0 left-0"
                                            style={{ 
                                              width: `${videoStates[lesson._id]?.volume || 0}%` 
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              {/* Playback Speed Dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 px-2">
                                    {videoStates[lesson._id]?.playbackRate}x
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white">
                                  <DropdownMenuItem onSelect={() => {
                                    setActiveLessonId(lesson._id);
                                    setPlaybackRate(lesson._id, 1);
                                  }}>
                                    1x
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => {
                                    setActiveLessonId(lesson._id);
                                    setPlaybackRate(lesson._id, 1.5);
                                  }}>
                                    1.5x
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => {
                                    setActiveLessonId(lesson._id);
                                    setPlaybackRate(lesson._id, 2);
                                  }}>
                                    2x
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 flex-shrink-0"
                                onClick={() => {
                                  setActiveLessonId(lesson._id);
                                  toggleFullscreen(lesson._id);
                                }}
                              >
                                <Maximize className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Exams Section */}
                      <Accordion type="single" collapsible className="w-full border border-border rounded-lg">
                        <AccordionItem value="exams" className="border-0">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="font-medium">الامتحانات</span>
                              <span className="text-xs bg-muted text-foreground px-2 py-0.5 rounded-full">
                                {getExamsForLesson(lesson._id).length}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            {getExamsForLesson(lesson._id).length > 0 ? (
                              <div className="space-y-3">
                                {getExamsForLesson(lesson._id).map(exam => (
                                  <div 
                                    key={exam._id} 
                                    className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-primary" />
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-foreground">{exam.title}</h4>
                                        <p className="text-xs text-muted-foreground">{exam.timeLimitMin} دقيقة</p>
                                      </div>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      onClick={() => navigate(`/exams/${exam._id}/take`)}
                                    >
                                      ابدأ الامتحان
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-3" />
                                <p>لا توجد امتحانات لهذا الدرس</p>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      
                      {/* Assignments Section */}
                      <Accordion type="single" collapsible className="w-full border border-border rounded-lg">
                        <AccordionItem value="assignments" className="border-0">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center gap-2">
                              <ClipboardList className="w-4 h-4" />
                              <span className="font-medium">الواجبات</span>
                              <span className="text-xs bg-muted text-foreground px-2 py-0.5 rounded-full">
                                {getAssignmentsForLesson(lesson._id).length}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            {getAssignmentsForLesson(lesson._id).length > 0 ? (
                              <div className="space-y-3">
                                {getAssignmentsForLesson(lesson._id).map(assignment => (
                                  <article
                                    key={assignment._id}
                                    className="bg-card border border-border rounded-lg p-3"
                                  >
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-foreground">{assignment.title}</h4>
                                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                          <span>{assignment.timeLimitMin} دقيقة</span>
                                          <span>الدرجة: {assignment.totalMarks}</span>
                                        </div>
                                      </div>
                                      <Button 
                                        size="sm"
                                        onClick={() => navigate(`/assignments/${assignment._id}/take`)} // Updated to use assignment route
                                      >
                                        ابدأ الواجب
                                      </Button>
                                    </div>
                                  </article>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-center py-4">لا توجد واجبات متاحة لهذا الدرس</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="exams" className="space-y-3 mt-6">
            {exams.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">لا توجد امتحانات متاحة</div>
            ) : (
              exams.map(exam => (
                <article
                  key={exam._id}
                  className="bg-card border border-border rounded-xl p-4 card-elevated"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{exam.title}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                        <span>{exam.timeLimitMin} دقيقة</span>
                        <span>الدرجة: {exam.totalMarks}</span>
                      </div>
                    </div>
                    <Button onClick={() => navigate(`/exams/${exam._id}/take`)}>
                      ابدأ الامتحان
                    </Button>
                  </div>
                </article>
              ))
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-3 mt-6">
            {assignments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">لا توجد واجبات متاحة</div>
            ) : (
              assignments.map(assignment => (
                <article
                  key={assignment._id}
                  className="bg-card border border-border rounded-xl p-4 card-elevated"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                        <span>{assignment.timeLimitMin} دقيقة</span>
                        <span>الدرجة: {assignment.totalMarks}</span>
                      </div>
                    </div>
                    <Button onClick={() => navigate(`/assignments/${assignment._id}/take`)}>
                      ابدأ الواجب
                    </Button>
                  </div>
                </article>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
