import { type Course as ServiceCourse } from '@/services/coursesService'; // Import Course interface from service
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';

// Define a compatible Course interface that works with both id and _id
interface Course {
  id: string;
  title: string;
  year: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  image: string;
  vodafoneNumber: string;
  month: number;
  _id?: string; // Optional to support both formats
}

interface CourseCardProps {
  course: Course;
  isSubscribed?: boolean;
  onSubscribe?: (course: Course) => void;
  onEnter?: (course: Course) => void;
}

export const CourseCard = ({ course, isSubscribed, onSubscribe, onEnter }: CourseCardProps) => {
  return (
    <article className="bg-card border border-border rounded-xl overflow-hidden card-elevated">
      <div className="h-48 bg-muted overflow-hidden">
        <img
          src={course.image}
          alt={`صورة كورس ${course.title}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="text-xs text-muted-foreground">{course.year}</div>
        <h3 className="text-lg font-semibold text-foreground line-clamp-1">{course.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{course.shortDescription}</p>
        <div className="flex items-center justify-between pt-2">
          <div className="text-2xl font-bold text-primary">
            {course.price === 0 ? (
              <span className="text-success">مجاني</span>
            ) : (
              <>
                {course.price}
                <span className="text-sm text-muted-foreground mr-1">ج.م</span>
              </>
            )}
          </div>
          {isSubscribed ? (
            <Button
              onClick={() => onEnter?.(course)}
              className="bg-success hover:bg-success/90 text-success-foreground hover:scale-105 transition-all duration-200"
              aria-label={`دخول كورس ${course.title}`}
            >
              دخول الكورس
            </Button>
          ) : (
            <Button
              onClick={() => onSubscribe?.(course)}
              variant="default"
              className="gap-2 hover:scale-105 transition-all duration-200"
              aria-label={`اشترك بالكورس ${course.title}`}
            >
              <ShoppingCart className="w-4 h-4" />
              اشترك الآن
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};