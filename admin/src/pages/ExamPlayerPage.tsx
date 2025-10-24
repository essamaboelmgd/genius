import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { getExamById, getExamQuestions, submitExamAnswers } from '@/services/examsService';
import { getAssignmentById, getAssignmentQuestions, submitAssignmentAnswers } from '@/services/assignmentsService';
import { type Exam, type Question, type Answer } from '@/services/examsService';
import { type Assignment } from '@/services/assignmentsService';

export default function ExamPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isAssignmentMode, setIsAssignmentMode] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 || !(exam?.timeLimitMin || assignment?.timeLimitMin)) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, exam, assignment]);

  const loadData = async () => {
    if (!id) return;

    try {
      // First try to find it as an exam
      const examData = await getExamById(id);
      
      if (examData) {
        setExam(examData);
        setIsAssignmentMode(false);
        
        const questionsData = await getExamQuestions(id);
        setQuestions(questionsData);
        setTimeLeft(examData.timeLimitMin * 60);
      }
    } catch (error) {
      // If not found as exam, try to find it as an assignment
      try {
        const assignmentData = await getAssignmentById(id);
        
        if (assignmentData) {
          setAssignment(assignmentData);
          setIsAssignmentMode(true);
          
          const questionsData = await getAssignmentQuestions(id);
          setQuestions(questionsData);
          setTimeLeft(assignmentData.timeLimitMin * 60);
        }
      } catch (assignmentError) {
        console.error('Error loading exam/assignment:', assignmentError);
      }
    }

    setLoading(false);
  };

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    
    // Convert answers to the format expected by the API
    const answersArray: Answer[] = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption
    }));

    try {
      let score = 0;
      let totalMarks = 0;
      
      if (isAssignmentMode && assignment) {
        const result = await submitAssignmentAnswers(id, answersArray);
        score = result.score;
        totalMarks = result.totalMarks;
      } else if (exam) {
        const result = await submitExamAnswers(id, answersArray);
        score = result.score;
        totalMarks = result.totalMarks;
      }

      // Navigate to results with state
      const basePath = isAssignmentMode ? '/assignments' : '/exams';
      navigate(`${basePath}/${id}/result`, {
        state: { answers, score, totalMarks, questions, isAssignmentMode }
      });
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <AppShell>
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      </AppShell>
    );
  }

  const currentItem = isAssignmentMode ? assignment : exam;
  const timeLimitMin = isAssignmentMode ? assignment?.timeLimitMin : exam?.timeLimitMin;

  if (!currentItem || questions.length === 0) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {isAssignmentMode ? 'الواجب غير موجود' : 'الامتحان غير موجود'}
          </p>
          <Button onClick={() => navigate(isAssignmentMode ? '/assignments' : '/exams')}>
            {isAssignmentMode ? 'العودة للواجبات' : 'العودة للامتحانات'}
          </Button>
        </div>
      </AppShell>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{currentItem.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                السؤال {currentQuestionIndex + 1} من {questions.length}
              </p>
            </div>
            {timeLimitMin && timeLimitMin > 0 && (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="w-5 h-5 text-accent" />
                <span className={timeLeft < 300 ? 'text-destructive' : 'text-foreground'}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {currentQuestion.content}
            </h2>

            {currentQuestion.type === 'image' && currentQuestion.content && (
              <div className="bg-muted rounded-lg p-4 max-w-md">
                <img
                  src={currentQuestion.content}
                  alt="صورة السؤال"
                  className="w-full h-auto rounded"
                />
              </div>
            )}
          </div>

          <RadioGroup
            value={answers[currentQuestion._id] || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion._id, value)}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-2 space-x-reverse border border-border rounded-lg p-4 hover:bg-muted/50 transition-smooth cursor-pointer"
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className="flex-1 cursor-pointer text-base"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 sticky bottom-4 bg-card border border-border rounded-xl p-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </Button>

          <div className="text-sm text-muted-foreground">
            تم الإجابة: {Object.keys(answers).length} / {questions.length}
          </div>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              className="bg-accent hover:bg-accent/90"
            >
              {isAssignmentMode ? 'تصحيح الواجب' : 'تصحيح الامتحان'}
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}