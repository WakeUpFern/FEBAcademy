// Placeholder types — replace with `npx supabase gen types typescript` output
// when connected to your Supabase project.

export type UserRole = "student" | "instructor" | "admin";
export type CourseType = "recorded" | "live";
export type CourseStatus = "draft" | "published" | "archived";
export type ModuleContentType =
  | "youtube_video"
  | "youtube_live"
  | "twitch_live"
  | "text"
  | "file";
export type LiveEventStatus = "scheduled" | "live" | "ended" | "cancelled";
export type BlogStatus = "draft" | "published" | "archived";
export type SubscriptionStatus = "active" | "cancelled" | "expired";
export type EnrollmentStatus = "active" | "completed" | "refunded";
export type NotificationType =
  | "new_course"
  | "new_blog"
  | "live_starting"
  | "course_update"
  | "general";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  username: string | null;
  website_url: string | null;
  social_links: Record<string, string>;
  is_verified: boolean;
  stripe_customer_id: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  instructor_id: string;
  category_id: string | null;
  type: CourseType;
  status: CourseStatus;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  thumbnail_url: string | null;
  trailer_youtube_id: string | null;
  level: "beginner" | "intermediate" | "advanced" | "all" | null;
  language: string;
  duration_minutes: number | null;
  is_free: boolean;
  price: number | null;
  currency: string;
  max_students: number | null;
  requirements: string[] | null;
  what_you_learn: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  section_id: string | null;
  content_type: ModuleContentType;
  title: string;
  description: string | null;
  youtube_video_id: string | null;
  youtube_url: string | null;
  duration_seconds: number | null;
  is_free_preview: boolean;
  is_published: boolean;
  sort_order: number;
  resources: Array<{ title: string; url: string; type?: string }>;
  transcript: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LiveEvent {
  id: string;
  course_id: string | null;
  instructor_id: string;
  status: LiveEventStatus;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  platform: "youtube" | "twitch";
  stream_id: string | null;
  stream_url: string | null;
  chat_enabled: boolean;
  scheduled_at: string;
  ended_at: string | null;
  replay_youtube_id: string | null;
  max_attendees: number | null;
  is_free: boolean;
  price: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  completed_at: string | null;
  amount_paid: number | null;
  currency: string | null;
  payment_intent: string | null;
  coupon_code: string | null;
}

export interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  course_id: string;
  completed: boolean;
  watched_seconds: number;
  playback_position: number;
  last_watched_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  author_id: string;
  status: BlogStatus;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown;
  content_html: string | null;
  cover_image_url: string | null;
  reading_time_min: number | null;
  is_featured: boolean;
  send_newsletter: boolean;
  newsletter_sent_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  related_course_id: string | null;
  published_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  user_id: string | null;
  status: SubscriptionStatus;
  first_name: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  source: string | null;
  tags: string[];
  resend_contact_id: string | null;
  metadata: Record<string, unknown>;
}

export interface Page {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: unknown;
  content_html: string | null;
  is_published: boolean;
  show_in_nav: boolean;
  nav_label: string | null;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  parent_id: string | null;
  target_type: "module" | "blog_post" | "live_event";
  target_id: string;
  content: string;
  is_pinned: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseReview {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  action_url: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  course_id: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

// Database type for Supabase client generics
// Replace this with the auto-generated types from `npx supabase gen types typescript`
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      courses: {
        Row: Course;
        Insert: Partial<Course> & { title: string; slug: string; instructor_id: string };
        Update: Partial<Course>;
      };
      course_sections: {
        Row: CourseSection;
        Insert: Partial<CourseSection> & { course_id: string; title: string };
        Update: Partial<CourseSection>;
      };
      modules: {
        Row: Module;
        Insert: Partial<Module> & { course_id: string; title: string };
        Update: Partial<Module>;
      };
      live_events: {
        Row: LiveEvent;
        Insert: Partial<LiveEvent> & {
          title: string;
          slug: string;
          instructor_id: string;
          scheduled_at: string;
        };
        Update: Partial<LiveEvent>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Partial<Enrollment> & { user_id: string; course_id: string };
        Update: Partial<Enrollment>;
      };
      module_progress: {
        Row: ModuleProgress;
        Insert: Partial<ModuleProgress> & {
          user_id: string;
          module_id: string;
          course_id: string;
        };
        Update: Partial<ModuleProgress>;
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Partial<BlogPost> & {
          title: string;
          slug: string;
          author_id: string;
        };
        Update: Partial<BlogPost>;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Partial<NewsletterSubscriber> & { email: string };
        Update: Partial<NewsletterSubscriber>;
      };
      pages: {
        Row: Page;
        Insert: Partial<Page> & {
          title: string;
          slug: string;
          author_id: string;
        };
        Update: Partial<Page>;
      };
      comments: {
        Row: Comment;
        Insert: Partial<Comment> & {
          user_id: string;
          target_type: string;
          target_id: string;
          content: string;
        };
        Update: Partial<Comment>;
      };
      course_reviews: {
        Row: CourseReview;
        Insert: Partial<CourseReview> & {
          user_id: string;
          course_id: string;
          rating: number;
        };
        Update: Partial<CourseReview>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> & {
          user_id: string;
          type: NotificationType;
          title: string;
        };
        Update: Partial<Notification>;
      };
      coupons: {
        Row: Coupon;
        Insert: Partial<Coupon> & {
          code: string;
          discount_type: "percent" | "fixed";
          discount_value: number;
        };
        Update: Partial<Coupon>;
      };
      categories: {
        Row: Category;
        Insert: Partial<Category> & { name: string; slug: string };
        Update: Partial<Category>;
      };
      tags: {
        Row: Tag;
        Insert: Partial<Tag> & { name: string; slug: string };
        Update: Partial<Tag>;
      };
      course_tags: {
        Row: { course_id: string; tag_id: string };
        Insert: { course_id: string; tag_id: string };
        Update: Partial<{ course_id: string; tag_id: string }>;
      };
      course_instructors: {
        Row: {
          course_id: string;
          instructor_id: string;
          role: string;
          added_at: string;
        };
        Insert: {
          course_id: string;
          instructor_id: string;
          role?: string;
        };
        Update: Partial<{
          course_id: string;
          instructor_id: string;
          role: string;
        }>;
      };
      blog_tags: {
        Row: { post_id: string; tag_id: string };
        Insert: { post_id: string; tag_id: string };
        Update: Partial<{ post_id: string; tag_id: string }>;
      };
      live_event_registrations: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          registered_at: string;
          attended: boolean;
        };
        Insert: { user_id: string; event_id: string };
        Update: Partial<{ attended: boolean }>;
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          details: Record<string, unknown>;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          action: string;
          actor_id?: string;
          target_type?: string;
          target_id?: string;
          details?: Record<string, unknown>;
          ip_address?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_course_progress: {
        Args: { p_user_id: string; p_course_id: string };
        Returns: number;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_course_instructor: {
        Args: { p_course_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      course_type: CourseType;
      course_status: CourseStatus;
      module_content_type: ModuleContentType;
      live_event_status: LiveEventStatus;
      blog_status: BlogStatus;
      subscription_status: SubscriptionStatus;
      enrollment_status: EnrollmentStatus;
      notification_type: NotificationType;
    };
  };
}
