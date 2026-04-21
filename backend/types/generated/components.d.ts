import type { Schema, Struct } from '@strapi/strapi';

export interface CourseSection extends Struct.ComponentSchema {
  collectionName: 'components_course_sections';
  info: {
    description: 'Logical grouping of lessons inside a course.';
    displayName: 'Section';
    icon: 'list';
  };
  attributes: {
    lessonSlugs: Schema.Attribute.JSON;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LessonExercise extends Struct.ComponentSchema {
  collectionName: 'components_lesson_exercises';
  info: {
    description: 'Exercise block inside a lesson.';
    displayName: 'Exercise';
    icon: 'puzzle-piece';
  };
  attributes: {
    answer: Schema.Attribute.JSON;
    explanation: Schema.Attribute.Text;
    meta: Schema.Attribute.JSON;
    options: Schema.Attribute.JSON;
    points: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
    question: Schema.Attribute.Text;
    slug: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<
      [
        'mcq',
        'fill-blank',
        'match-pairs',
        'translate',
        'word-order',
        'reading',
        'theory',
        'frame',
        'image',
        'video',
      ]
    > &
      Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'course.section': CourseSection;
      'lesson.exercise': LessonExercise;
    }
  }
}
