import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminSession extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_sessions';
  info: {
    description: 'Session Manager storage';
    displayName: 'Session';
    name: 'Session';
    pluralName: 'sessions';
    singularName: 'session';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
    i18n: {
      localized: false;
    };
  };
  attributes: {
    absoluteExpiresAt: Schema.Attribute.DateTime & Schema.Attribute.Private;
    childId: Schema.Attribute.String & Schema.Attribute.Private;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::session'> &
      Schema.Attribute.Private;
    origin: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sessionId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique;
    status: Schema.Attribute.String & Schema.Attribute.Private;
    type: Schema.Attribute.String & Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiAchievementAchievement extends Struct.CollectionTypeSchema {
  collectionName: 'achievements';
  info: {
    description: 'Catalog of unlockable achievements.';
    displayName: 'Achievement';
    pluralName: 'achievements';
    singularName: 'achievement';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    category: Schema.Attribute.Enumeration<
      ['streak', 'lessons', 'coins', 'social', 'kids', 'mastery', 'special']
    > &
      Schema.Attribute.DefaultTo<'lessons'>;
    coinReward: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    criteria: Schema.Attribute.JSON;
    description: Schema.Attribute.Text;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    icon: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::achievement.achievement'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    tier: Schema.Attribute.Enumeration<
      ['bronze', 'silver', 'gold', 'platinum']
    > &
      Schema.Attribute.DefaultTo<'bronze'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    xpReward: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiAdminProfileAdminProfile
  extends Struct.CollectionTypeSchema {
  collectionName: 'admin_profiles';
  info: {
    description: 'Role-specific data for users with role=admin. 1:1 to user-profile.';
    displayName: 'Admin Profile';
    pluralName: 'admin-profiles';
    singularName: 'admin-profile';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ipAllowlist: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::admin-profile.admin-profile'
    > &
      Schema.Attribute.Private;
    permissions: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    twoFactorEnabled: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Required;
  };
}

export interface ApiAdultProfileAdultProfile
  extends Struct.CollectionTypeSchema {
  collectionName: 'adult_profiles';
  info: {
    description: 'Role-specific data for users with role=adult. 1:1 to user-profile.';
    displayName: 'Adult Profile';
    pluralName: 'adult-profiles';
    singularName: 'adult-profile';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    currentLevel: Schema.Attribute.Enumeration<
      ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    >;
    goal: Schema.Attribute.Enumeration<
      ['exam', 'travel', 'career', 'hobby', 'school', 'other']
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::adult-profile.adult-profile'
    > &
      Schema.Attribute.Private;
    preferredTimes: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    selfStudyEnabled: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    streakDays: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    streakLastAt: Schema.Attribute.DateTime;
    targetLevel: Schema.Attribute.Enumeration<
      ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    >;
    totalCoins: Schema.Attribute.BigInteger & Schema.Attribute.DefaultTo<'0'>;
    totalXp: Schema.Attribute.BigInteger & Schema.Attribute.DefaultTo<'0'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Required;
    weeklyGoalMin: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<90>;
  };
}

export interface ApiAttendanceRecordAttendanceRecord
  extends Struct.CollectionTypeSchema {
  collectionName: 'attendance_records';
  info: {
    description: 'Per-session attendance mark (present/absent/late/excused) for a student.';
    displayName: 'Attendance Record';
    pluralName: 'attendance-records';
    singularName: 'attendance-record';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::attendance-record.attendance-record'
    > &
      Schema.Attribute.Private;
    note: Schema.Attribute.Text;
    publishedAt: Schema.Attribute.DateTime;
    recordedAt: Schema.Attribute.DateTime;
    recordedBy: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher-profile.teacher-profile'
    >;
    session: Schema.Attribute.Relation<'manyToOne', 'api::session.session'>;
    status: Schema.Attribute.Enumeration<
      ['present', 'absent', 'late', 'excused']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'present'>;
    student: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAuditLogAuditLog extends Struct.CollectionTypeSchema {
  collectionName: 'audit_logs';
  info: {
    description: 'Append-only audit trail for security-relevant mutations. Written by the global audit-log middleware; rows are never updated or deleted.';
    displayName: 'Audit Log';
    pluralName: 'audit-logs';
    singularName: 'audit-log';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    actor: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    >;
    actorIp: Schema.Attribute.String;
    actorUserAgent: Schema.Attribute.String;
    after: Schema.Attribute.JSON;
    before: Schema.Attribute.JSON;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entityId: Schema.Attribute.String & Schema.Attribute.Required;
    entityType: Schema.Attribute.String & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::audit-log.audit-log'
    > &
      Schema.Attribute.Private;
    metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    requestId: Schema.Attribute.String;
    statusCode: Schema.Attribute.Integer;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCharacterCharacter extends Struct.CollectionTypeSchema {
  collectionName: 'characters';
  info: {
    description: 'Kids Zone playable companion character. Each character has a set of emotion images the FE swaps based on mood.';
    displayName: 'Character';
    pluralName: 'characters';
    singularName: 'character';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    emotions: Schema.Attribute.JSON;
    fallbackEmotion: Schema.Attribute.Enumeration<
      [
        'idle',
        'happy',
        'celebrate',
        'sleepy',
        'angry',
        'sad',
        'thinking',
        'surprised',
      ]
    > &
      Schema.Attribute.DefaultTo<'idle'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::character.character'
    > &
      Schema.Attribute.Private;
    nameEn: Schema.Attribute.String & Schema.Attribute.Required;
    nameUa: Schema.Attribute.String;
    orderIndex: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    priceCoins: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    rarity: Schema.Attribute.Enumeration<
      ['common', 'rare', 'epic', 'legendary']
    > &
      Schema.Attribute.DefaultTo<'common'>;
    slug: Schema.Attribute.UID<'nameEn'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiConsentLogConsentLog extends Struct.CollectionTypeSchema {
  collectionName: 'consent_logs';
  info: {
    description: 'Append-only log of user consents (terms, privacy, marketing, cookies, parental). GDPR audit trail.';
    displayName: 'Consent Log';
    pluralName: 'consent-logs';
    singularName: 'consent-log';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    acceptedAt: Schema.Attribute.DateTime;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ip: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::consent-log.consent-log'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    revokedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<
      [
        'terms',
        'privacy',
        'marketing',
        'cookiesAnalytics',
        'cookiesMarketing',
        'parental',
      ]
    > &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Required;
    userAgent: Schema.Attribute.String;
    version: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ApiCourseCourse extends Struct.CollectionTypeSchema {
  collectionName: 'courses';
  info: {
    description: 'Top-level learning program (a curriculum).';
    displayName: 'Course';
    pluralName: 'courses';
    singularName: 'course';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    audience: Schema.Attribute.Enumeration<['kids', 'teens', 'adults', 'any']> &
      Schema.Attribute.DefaultTo<'any'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    currency: Schema.Attribute.Enumeration<['UAH', 'USD', 'EUR']> &
      Schema.Attribute.DefaultTo<'UAH'>;
    description: Schema.Attribute.Text;
    descriptionLong: Schema.Attribute.JSON;
    descriptionShort: Schema.Attribute.Text;
    durationWeeks: Schema.Attribute.Integer;
    externalUrl: Schema.Attribute.String;
    iconEmoji: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 8;
      }>;
    isNew: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    kind: Schema.Attribute.Enumeration<['course', 'book', 'video', 'game']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'course'>;
    lessons: Schema.Attribute.Relation<'oneToMany', 'api::lesson.lesson'>;
    level: Schema.Attribute.Enumeration<
      ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    > &
      Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::course.course'
    > &
      Schema.Attribute.Private;
    maxStudents: Schema.Attribute.Integer;
    organization: Schema.Attribute.Relation<
      'manyToOne',
      'api::organization.organization'
    >;
    preview: Schema.Attribute.JSON;
    price: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    ratingAvg: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    reviewCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    sections: Schema.Attribute.Component<'course.section', true>;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    status: Schema.Attribute.Enumeration<
      ['available', 'soldOut', 'comingSoon', 'archived']
    > &
      Schema.Attribute.DefaultTo<'available'>;
    subtitle: Schema.Attribute.String;
    tags: Schema.Attribute.JSON;
    teacher: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher-profile.teacher-profile'
    >;
    thumbnail: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    titleUa: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiGroupGroup extends Struct.CollectionTypeSchema {
  collectionName: 'groups';
  info: {
    description: 'A teacher-owned class/cohort. Students are user-profiles linked via the `members` m2m.';
    displayName: 'Group';
    pluralName: 'groups';
    singularName: 'group';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    activeFrom: Schema.Attribute.Date;
    activeTo: Schema.Attribute.Date;
    avgAttendance: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    avgHomework: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    level: Schema.Attribute.Enumeration<
      ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    > &
      Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::group.group'> &
      Schema.Attribute.Private;
    meetUrl: Schema.Attribute.String;
    members: Schema.Attribute.Relation<
      'manyToMany',
      'api::user-profile.user-profile'
    >;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    scheduleRrule: Schema.Attribute.String;
    teacher: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher-profile.teacher-profile'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHomeworkSubmissionHomeworkSubmission
  extends Struct.CollectionTypeSchema {
  collectionName: 'homework_submissions';
  info: {
    description: 'Per-student instance of a homework task (created on homework publish; carries answers, teacher grade, feedback).';
    displayName: 'Homework Submission';
    pluralName: 'homework-submissions';
    singularName: 'homework-submission';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    answers: Schema.Attribute.JSON;
    attachments: Schema.Attribute.Media<undefined, true>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    gradedAt: Schema.Attribute.DateTime;
    homework: Schema.Attribute.Relation<'manyToOne', 'api::homework.homework'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::homework-submission.homework-submission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    score: Schema.Attribute.Decimal;
    status: Schema.Attribute.Enumeration<
      [
        'notStarted',
        'inProgress',
        'submitted',
        'reviewed',
        'returned',
        'overdue',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'notStarted'>;
    student: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    >;
    submittedAt: Schema.Attribute.DateTime;
    teacherFeedback: Schema.Attribute.Text;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHomeworkHomework extends Struct.CollectionTypeSchema {
  collectionName: 'homeworks';
  info: {
    description: 'Teacher-assigned homework.';
    displayName: 'Homework';
    pluralName: 'homeworks';
    singularName: 'homework';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    assignees: Schema.Attribute.Relation<
      'manyToMany',
      'api::user-profile.user-profile'
    >;
    course: Schema.Attribute.Relation<'manyToOne', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    dueAt: Schema.Attribute.DateTime;
    exercises: Schema.Attribute.Component<'lesson.exercise', true>;
    lesson: Schema.Attribute.Relation<'manyToOne', 'api::lesson.lesson'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::homework.homework'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['draft', 'published', 'closed', 'archived']
    > &
      Schema.Attribute.DefaultTo<'draft'>;
    teacher: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher-profile.teacher-profile'
    >;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiKidsProfileKidsProfile extends Struct.CollectionTypeSchema {
  collectionName: 'kids_profiles';
  info: {
    description: 'Role-specific data for users with role=kids. 1:1 to user-profile.';
    displayName: 'Kids Profile';
    pluralName: 'kids-profiles';
    singularName: 'kids-profile';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    ageGroup: Schema.Attribute.Enumeration<
      ['age2to4', 'age4to7', 'age7to11', 'age11plus']
    >;
    characterMood: Schema.Attribute.Enumeration<
      [
        'happy',
        'excited',
        'neutral',
        'thinking',
        'surprised',
        'sleepy',
        'proud',
        'sad',
        'confused',
        'celebrating',
      ]
    >;
    companionAnimal: Schema.Attribute.Enumeration<
      ['fox', 'cat', 'dragon', 'rabbit', 'raccoon', 'frog']
    > &
      Schema.Attribute.Required;
    companionName: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Friend'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    hardCurrency: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::kids-profile.kids-profile'
    > &
      Schema.Attribute.Private;
    pinHash: Schema.Attribute.String & Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    showRealName: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    streakDays: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    streakLastAt: Schema.Attribute.DateTime;
    totalCoins: Schema.Attribute.BigInteger & Schema.Attribute.DefaultTo<'500'>;
    totalXp: Schema.Attribute.BigInteger & Schema.Attribute.DefaultTo<'0'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Required;
  };
}

export interface ApiLessonPaymentLessonPayment
  extends Struct.CollectionTypeSchema {
  collectionName: 'lesson_payments';
  info: {
    description: 'Per-session earning record for a teacher (gross/net, currency, status).';
    displayName: 'Lesson Payment';
    pluralName: 'lesson-payments';
    singularName: 'lesson-payment';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    currency: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 8;
      }> &
      Schema.Attribute.DefaultTo<'UAH'>;
    grossAmount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::lesson-payment.lesson-payment'
    > &
      Schema.Attribute.Private;
    netAmount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    note: Schema.Attribute.Text;
    paidAt: Schema.Attribute.DateTime;
    payout: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher-payout.teacher-payout'
    >;
    publishedAt: Schema.Attribute.DateTime;
    session: Schema.Attribute.Relation<'manyToOne', 'api::session.session'>;
    status: Schema.Attribute.Enumeration<
      ['pending', 'processing', 'paid', 'cancelled']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'pending'>;
    teacher: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher-profile.teacher-profile'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiLessonLesson extends Struct.CollectionTypeSchema {
  collectionName: 'lessons';
  info: {
    description: 'Atomic learning unit inside a course.';
    displayName: 'Lesson';
    pluralName: 'lessons';
    singularName: 'lesson';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    course: Schema.Attribute.Relation<'manyToOne', 'api::course.course'>;
    cover: Schema.Attribute.Media<'images'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    durationMin: Schema.Attribute.Integer;
    exercises: Schema.Attribute.Component<'lesson.exercise', true>;
    isFree: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    level: Schema.Attribute.Enumeration<
      ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::lesson.lesson'
    > &
      Schema.Attribute.Private;
    orderIndex: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    originalLesson: Schema.Attribute.Relation<
      'manyToOne',
      'api::lesson.lesson'
    >;
    owner: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher-profile.teacher-profile'
    >;
    publishedAt: Schema.Attribute.DateTime;
    sectionSlug: Schema.Attribute.String;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    source: Schema.Attribute.Enumeration<
      ['platform', 'own', 'copy', 'template']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'platform'>;
    steps: Schema.Attribute.JSON;
    tags: Schema.Attribute.JSON;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    topic: Schema.Attribute.String;
    transcript: Schema.Attribute.Text;
    type: Schema.Attribute.Enumeration<
      ['video', 'quiz', 'reading', 'interactive']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'video'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    video: Schema.Attribute.Media<'videos'>;
    videoUrl: Schema.Attribute.String;
    xp: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
  };
}

export interface ApiMessageMessage extends Struct.CollectionTypeSchema {
  collectionName: 'messages';
  info: {
    description: 'Chat message inside a thread.';
    displayName: 'Message';
    pluralName: 'messages';
    singularName: 'message';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    attachments: Schema.Attribute.Media<undefined, true>;
    author: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    >;
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::message.message'
    > &
      Schema.Attribute.Private;
    pinned: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    publishedAt: Schema.Attribute.DateTime;
    readBy: Schema.Attribute.Relation<
      'manyToMany',
      'api::user-profile.user-profile'
    >;
    replyTo: Schema.Attribute.Relation<'manyToOne', 'api::message.message'>;
    thread: Schema.Attribute.Relation<'manyToOne', 'api::thread.thread'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiMiniTaskAttemptMiniTaskAttempt
  extends Struct.CollectionTypeSchema {
  collectionName: 'mini_task_attempts';
  info: {
    description: 'Per-user submission of a mini-task. Auto-graded for closed-form exercises (mcq, fill-blank, translate, word-order, match-pairs); open-ended kinds wait for teacher review. Coins are awarded on the FIRST submission per (user, task) only \u2014 proportional to score.';
    displayName: 'Mini Task Attempt';
    pluralName: 'mini-task-attempts';
    singularName: 'mini-task-attempt';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    answer: Schema.Attribute.JSON;
    awardedCoins: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    completedAt: Schema.Attribute.DateTime;
    correct: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::mini-task-attempt.mini-task-attempt'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    score: Schema.Attribute.Decimal;
    status: Schema.Attribute.Enumeration<['submitted', 'reviewed']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'submitted'>;
    task: Schema.Attribute.Relation<'manyToOne', 'api::mini-task.mini-task'>;
    teacherFeedback: Schema.Attribute.Text;
    timeSpentSec: Schema.Attribute.Integer;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    >;
  };
}

export interface ApiMiniTaskMiniTask extends Struct.CollectionTypeSchema {
  collectionName: 'mini_tasks';
  info: {
    description: 'Teacher-authored short exercise (1-3 minutes).';
    displayName: 'Mini Task';
    pluralName: 'mini-tasks';
    singularName: 'mini-task';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    author: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher-profile.teacher-profile'
    >;
    coinReward: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<5>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    durationMin: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<5>;
    exercise: Schema.Attribute.Component<'lesson.exercise', false>;
    isPublic: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    kind: Schema.Attribute.Enumeration<
      [
        'quiz',
        'level-quiz',
        'daily-challenge',
        'word-of-day',
        'listening',
        'sentence-builder',
      ]
    > &
      Schema.Attribute.DefaultTo<'quiz'>;
    level: Schema.Attribute.Enumeration<
      ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::mini-task.mini-task'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    topic: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiOrganizationOrganization
  extends Struct.CollectionTypeSchema {
  collectionName: 'organizations';
  info: {
    description: 'Multi-tenant anchor. Every tenant-scoped content-type links here.';
    displayName: 'Organization';
    pluralName: 'organizations';
    singularName: 'organization';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    billingEmail: Schema.Attribute.Email;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::organization.organization'
    > &
      Schema.Attribute.Private;
    logo: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    primaryColor: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    status: Schema.Attribute.Enumeration<['active', 'suspended', 'trial']> &
      Schema.Attribute.DefaultTo<'active'>;
    timezone: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Europe/Kyiv'>;
    trialEndsAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiParentLinkParentLink extends Struct.CollectionTypeSchema {
  collectionName: 'parent_links';
  info: {
    description: 'Consent edge between parent and kid user-profiles. Supports multiple parents per child and multiple children per parent.';
    displayName: 'Parent Link';
    pluralName: 'parent-links';
    singularName: 'parent-link';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    canMessageTeacher: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    canPay: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    canViewChat: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    child: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Required;
    consentSignedAt: Schema.Attribute.DateTime & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::parent-link.parent-link'
    > &
      Schema.Attribute.Private;
    parent: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    relationship: Schema.Attribute.Enumeration<
      ['mother', 'father', 'guardian', 'other']
    > &
      Schema.Attribute.DefaultTo<'guardian'>;
    revokedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiParentProfileParentProfile
  extends Struct.CollectionTypeSchema {
  collectionName: 'parent_profiles';
  info: {
    description: 'Role-specific data for users with role=parent. 1:1 to user-profile.';
    displayName: 'Parent Profile';
    pluralName: 'parent-profiles';
    singularName: 'parent-profile';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    billingAddress: Schema.Attribute.JSON;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    displayName: Schema.Attribute.String;
    emergencyPhone: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::parent-profile.parent-profile'
    > &
      Schema.Attribute.Private;
    preferredContact: Schema.Attribute.Enumeration<['email', 'phone', 'both']> &
      Schema.Attribute.DefaultTo<'email'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Required;
  };
}

export interface ApiRefreshTokenRefreshToken
  extends Struct.CollectionTypeSchema {
  collectionName: 'refresh_tokens';
  info: {
    description: 'Rotating refresh tokens. Stored as argon2id hash, never plaintext.';
    displayName: 'Refresh Token';
    pluralName: 'refresh-tokens';
    singularName: 'refresh-token';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceId: Schema.Attribute.String;
    expiresAt: Schema.Attribute.DateTime & Schema.Attribute.Required;
    ip: Schema.Attribute.String;
    lastUsedAt: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::refresh-token.refresh-token'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    revokedAt: Schema.Attribute.DateTime;
    tokenHash: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Required;
    userAgent: Schema.Attribute.String;
  };
}

export interface ApiReviewReview extends Struct.CollectionTypeSchema {
  collectionName: 'reviews';
  info: {
    description: 'Student review on a course.';
    displayName: 'Review';
    pluralName: 'reviews';
    singularName: 'review';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    author: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    >;
    body: Schema.Attribute.Text;
    course: Schema.Attribute.Relation<'manyToOne', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::review.review'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    rating: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
    title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    verified: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface ApiRewardEventRewardEvent extends Struct.CollectionTypeSchema {
  collectionName: 'reward_events';
  info: {
    description: 'Append-only ledger of every coin/XP delta awarded to a kid. `sourceKey` is the idempotency key \u2014 `awardOnAction` skips the write when a row already exists for the same key, so retries (lifecycle replays, double POSTs, etc.) cannot double-credit. Powers the per-kid motivation report and any future reconciliation against `kids-profile.totalCoins` / `totalXp`.';
    displayName: 'Reward Event';
    pluralName: 'reward-events';
    singularName: 'reward-event';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    action: Schema.Attribute.Enumeration<
      [
        'lesson',
        'minitask',
        'homework',
        'attendance',
        'streak',
        'achievement',
        'grant',
      ]
    > &
      Schema.Attribute.Required;
    coinsDelta: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::reward-event.reward-event'
    > &
      Schema.Attribute.Private;
    meta: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    sourceKey: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    >;
    xpDelta: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiRoomRoom extends Struct.CollectionTypeSchema {
  collectionName: 'rooms';
  info: {
    description: 'Kids Zone room backdrop. The starter room (bedroom) has coinsRequired=0 and is auto-unlocked for every new inventory.';
    displayName: 'Room';
    pluralName: 'rooms';
    singularName: 'room';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    background: Schema.Attribute.String;
    coinsRequired: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    iconEmoji: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::room.room'> &
      Schema.Attribute.Private;
    nameEn: Schema.Attribute.String & Schema.Attribute.Required;
    nameUa: Schema.Attribute.String;
    orderIndex: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'nameEn'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSessionSession extends Struct.CollectionTypeSchema {
  collectionName: 'sessions';
  info: {
    description: 'Scheduled live calendar event (group lesson, 1:1, trial, consultation).';
    displayName: 'Session';
    pluralName: 'sessions';
    singularName: 'session';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    attendees: Schema.Attribute.Relation<
      'manyToMany',
      'api::user-profile.user-profile'
    >;
    course: Schema.Attribute.Relation<'manyToOne', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    durationMin: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<60>;
    grade: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    joinUrl: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::session.session'
    > &
      Schema.Attribute.Private;
    maxAttendees: Schema.Attribute.Integer;
    notes: Schema.Attribute.Text;
    organization: Schema.Attribute.Relation<
      'manyToOne',
      'api::organization.organization'
    >;
    publishedAt: Schema.Attribute.DateTime;
    recordingUrl: Schema.Attribute.String;
    startAt: Schema.Attribute.DateTime & Schema.Attribute.Required;
    status: Schema.Attribute.Enumeration<
      ['scheduled', 'live', 'completed', 'cancelled', 'no-show']
    > &
      Schema.Attribute.DefaultTo<'scheduled'>;
    teacher: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher-profile.teacher-profile'
    >;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<
      ['group', 'one-to-one', 'trial', 'consultation']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'group'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiShopItemShopItem extends Struct.CollectionTypeSchema {
  collectionName: 'shop_items';
  info: {
    description: 'Kids-zone shop inventory item.';
    displayName: 'Shop Item';
    pluralName: 'shop-items';
    singularName: 'shop-item';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    category: Schema.Attribute.Enumeration<
      ['furniture', 'decor', 'outfit', 'special']
    > &
      Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    emoji: Schema.Attribute.String;
    imageActive: Schema.Attribute.Media<'images'>;
    imageHover: Schema.Attribute.Media<'images'>;
    imageIdle: Schema.Attribute.Media<'images'>;
    isNew: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    levelRequired: Schema.Attribute.Enumeration<
      ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    > &
      Schema.Attribute.DefaultTo<'A1'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::shop-item.shop-item'
    > &
      Schema.Attribute.Private;
    nameEn: Schema.Attribute.String & Schema.Attribute.Required;
    nameUa: Schema.Attribute.String;
    phonetic: Schema.Attribute.String;
    price: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    rarity: Schema.Attribute.Enumeration<
      ['common', 'uncommon', 'rare', 'legendary']
    > &
      Schema.Attribute.DefaultTo<'common'>;
    slotOffset: Schema.Attribute.JSON;
    slug: Schema.Attribute.UID<'nameEn'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTeacherPayoutTeacherPayout
  extends Struct.CollectionTypeSchema {
  collectionName: 'teacher_payouts';
  info: {
    description: 'Monthly payout aggregate for a teacher \u2014 rolls up lesson-payments for a given period.';
    displayName: 'Teacher Payout';
    pluralName: 'teacher-payouts';
    singularName: 'teacher-payout';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    currency: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 8;
      }> &
      Schema.Attribute.DefaultTo<'UAH'>;
    lessonPayments: Schema.Attribute.Relation<
      'oneToMany',
      'api::lesson-payment.lesson-payment'
    >;
    lessonsCount: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::teacher-payout.teacher-payout'
    > &
      Schema.Attribute.Private;
    note: Schema.Attribute.Text;
    paidAt: Schema.Attribute.DateTime;
    periodMonth: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
          min: 1;
        },
        number
      >;
    periodYear: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 2100;
          min: 2020;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    ratePerLesson: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    status: Schema.Attribute.Enumeration<
      ['pending', 'processing', 'paid', 'cancelled']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'pending'>;
    teacher: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher-profile.teacher-profile'
    >;
    total: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTeacherProfileTeacherProfile
  extends Struct.CollectionTypeSchema {
  collectionName: 'teacher_profiles';
  info: {
    description: 'Role-specific data for users with role=teacher. 1:1 to user-profile.';
    displayName: 'Teacher Profile';
    pluralName: 'teacher-profiles';
    singularName: 'teacher-profile';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    acceptsTrial: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    bio: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    hourlyRate: Schema.Attribute.BigInteger;
    languagesSpoken: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::teacher-profile.teacher-profile'
    > &
      Schema.Attribute.Private;
    maxStudents: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<30>;
    publicSlug: Schema.Attribute.String & Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    rating: Schema.Attribute.Decimal;
    ratingCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    specializations: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Required;
    verificationDoc: Schema.Attribute.Media<'files' | 'images'>;
    verified: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    videoMeetUrl: Schema.Attribute.String;
    yearsExperience: Schema.Attribute.Integer;
  };
}

export interface ApiThreadThread extends Struct.CollectionTypeSchema {
  collectionName: 'threads';
  info: {
    description: 'Chat conversation between user-profiles (student/parent/group).';
    displayName: 'Thread';
    pluralName: 'threads';
    singularName: 'thread';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    kind: Schema.Attribute.Enumeration<['student', 'parent', 'group']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'student'>;
    lastMessageAt: Schema.Attribute.DateTime;
    lastMessageBody: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::thread.thread'
    > &
      Schema.Attribute.Private;
    messages: Schema.Attribute.Relation<'oneToMany', 'api::message.message'>;
    participants: Schema.Attribute.Relation<
      'manyToMany',
      'api::user-profile.user-profile'
    >;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiUserAchievementUserAchievement
  extends Struct.CollectionTypeSchema {
  collectionName: 'user_achievements';
  info: {
    description: 'Records an achievement earned by a user.';
    displayName: 'User Achievement';
    pluralName: 'user-achievements';
    singularName: 'user-achievement';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    achievement: Schema.Attribute.Relation<
      'manyToOne',
      'api::achievement.achievement'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    earnedAt: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-achievement.user-achievement'
    > &
      Schema.Attribute.Private;
    progress: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<100>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    >;
  };
}

export interface ApiUserInventoryUserInventory
  extends Struct.CollectionTypeSchema {
  collectionName: 'user_inventories';
  info: {
    description: 'Kids Zone inventory state (coins-independent). 1:1 to user-profile. Owns shop items, outfit, placed items, and active room/character (rooms/character added in Phase C).';
    displayName: 'User Inventory';
    pluralName: 'user-inventories';
    singularName: 'user-inventory';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    activeCharacter: Schema.Attribute.Relation<
      'manyToOne',
      'api::character.character'
    >;
    activeRoom: Schema.Attribute.Relation<'manyToOne', 'api::room.room'>;
    activeRoomBackground: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    equippedItems: Schema.Attribute.Relation<
      'manyToMany',
      'api::shop-item.shop-item'
    >;
    freeLootBoxes: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-inventory.user-inventory'
    > &
      Schema.Attribute.Private;
    outfit: Schema.Attribute.JSON;
    ownedCharacters: Schema.Attribute.Relation<
      'manyToMany',
      'api::character.character'
    >;
    ownedRoomBackgrounds: Schema.Attribute.JSON;
    ownedShopItems: Schema.Attribute.Relation<
      'manyToMany',
      'api::shop-item.shop-item'
    >;
    placedItems: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    seedVersion: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    unlockedRooms: Schema.Attribute.Relation<'manyToMany', 'api::room.room'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Required;
  };
}

export interface ApiUserProfileUserProfile extends Struct.CollectionTypeSchema {
  collectionName: 'user_profiles';
  info: {
    description: '1:1 profile attached to Strapi users-permissions User. Carries role, org link, i18n/tz, and 1:1 references to role-specific profile.';
    displayName: 'User Profile';
    pluralName: 'user-profiles';
    singularName: 'user-profile';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    adminProfile: Schema.Attribute.Relation<
      'oneToOne',
      'api::admin-profile.admin-profile'
    >;
    adultProfile: Schema.Attribute.Relation<
      'oneToOne',
      'api::adult-profile.adult-profile'
    >;
    avatar: Schema.Attribute.Media<'images'>;
    consentPrivacyAt: Schema.Attribute.DateTime;
    consentTermsAt: Schema.Attribute.DateTime;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dateOfBirth: Schema.Attribute.Date;
    deletedAt: Schema.Attribute.DateTime;
    displayName: Schema.Attribute.String;
    firstName: Schema.Attribute.String & Schema.Attribute.Required;
    kidsProfile: Schema.Attribute.Relation<
      'oneToOne',
      'api::kids-profile.kids-profile'
    >;
    lastName: Schema.Attribute.String;
    level: Schema.Attribute.Enumeration<
      ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Private;
    marketingOptIn: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    organization: Schema.Attribute.Relation<
      'manyToOne',
      'api::organization.organization'
    >;
    parentalConsentBy: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    >;
    parentProfile: Schema.Attribute.Relation<
      'oneToOne',
      'api::parent-profile.parent-profile'
    >;
    phone: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Enumeration<
      ['kids', 'adult', 'teacher', 'parent', 'admin']
    > &
      Schema.Attribute.Required;
    status: Schema.Attribute.Enumeration<
      ['active', 'paused', 'archived', 'deleted']
    > &
      Schema.Attribute.DefaultTo<'active'>;
    teacherProfile: Schema.Attribute.Relation<
      'oneToOne',
      'api::teacher-profile.teacher-profile'
    >;
    threads: Schema.Attribute.Relation<'manyToMany', 'api::thread.thread'>;
    timezone: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Europe/Kyiv'>;
    tokenVersion: Schema.Attribute.Integer &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Required;
  };
}

export interface ApiUserProgressUserProgress
  extends Struct.CollectionTypeSchema {
  collectionName: 'user_progresses';
  info: {
    description: "Tracks a user's progress on a single lesson.";
    displayName: 'User Progress';
    pluralName: 'user-progresses';
    singularName: 'user-progress';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    attempts: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    completedAt: Schema.Attribute.DateTime;
    course: Schema.Attribute.Relation<'manyToOne', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    lastAttemptAt: Schema.Attribute.DateTime;
    lesson: Schema.Attribute.Relation<'manyToOne', 'api::lesson.lesson'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-progress.user-progress'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    score: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    status: Schema.Attribute.Enumeration<
      ['notStarted', 'inProgress', 'completed', 'skipped']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'notStarted'>;
    timeSpentSec: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'api::user-profile.user-profile'
    >;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.Text;
    caption: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    focalPoint: Schema.Attribute.JSON;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.Text;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.Text & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    profile: Schema.Attribute.Relation<
      'oneToOne',
      'api::user-profile.user-profile'
    >;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::session': AdminSession;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::achievement.achievement': ApiAchievementAchievement;
      'api::admin-profile.admin-profile': ApiAdminProfileAdminProfile;
      'api::adult-profile.adult-profile': ApiAdultProfileAdultProfile;
      'api::attendance-record.attendance-record': ApiAttendanceRecordAttendanceRecord;
      'api::audit-log.audit-log': ApiAuditLogAuditLog;
      'api::character.character': ApiCharacterCharacter;
      'api::consent-log.consent-log': ApiConsentLogConsentLog;
      'api::course.course': ApiCourseCourse;
      'api::group.group': ApiGroupGroup;
      'api::homework-submission.homework-submission': ApiHomeworkSubmissionHomeworkSubmission;
      'api::homework.homework': ApiHomeworkHomework;
      'api::kids-profile.kids-profile': ApiKidsProfileKidsProfile;
      'api::lesson-payment.lesson-payment': ApiLessonPaymentLessonPayment;
      'api::lesson.lesson': ApiLessonLesson;
      'api::message.message': ApiMessageMessage;
      'api::mini-task-attempt.mini-task-attempt': ApiMiniTaskAttemptMiniTaskAttempt;
      'api::mini-task.mini-task': ApiMiniTaskMiniTask;
      'api::organization.organization': ApiOrganizationOrganization;
      'api::parent-link.parent-link': ApiParentLinkParentLink;
      'api::parent-profile.parent-profile': ApiParentProfileParentProfile;
      'api::refresh-token.refresh-token': ApiRefreshTokenRefreshToken;
      'api::review.review': ApiReviewReview;
      'api::reward-event.reward-event': ApiRewardEventRewardEvent;
      'api::room.room': ApiRoomRoom;
      'api::session.session': ApiSessionSession;
      'api::shop-item.shop-item': ApiShopItemShopItem;
      'api::teacher-payout.teacher-payout': ApiTeacherPayoutTeacherPayout;
      'api::teacher-profile.teacher-profile': ApiTeacherProfileTeacherProfile;
      'api::thread.thread': ApiThreadThread;
      'api::user-achievement.user-achievement': ApiUserAchievementUserAchievement;
      'api::user-inventory.user-inventory': ApiUserInventoryUserInventory;
      'api::user-profile.user-profile': ApiUserProfileUserProfile;
      'api::user-progress.user-progress': ApiUserProgressUserProgress;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
