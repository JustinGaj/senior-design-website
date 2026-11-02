export type PostStatus = "published" | "unpublished";
export type PostImage = "engineering" | "concept" | "flight";

export type PostContent = {
  title: string;
  summary: string;
  body: string;
  category: string;
  image: PostImage;
  href: string | null;
};

export type PlaneActivity = {
  id: string;
  workItemId: string;
  createdAt: string;
  field: string | null;
  verb: string | null;
  oldValue: string | null;
  newValue: string | null;
  comment: string | null;
  actor: string | null;
  url: string | null;
};

export type Submission = PostContent & {
  periodStart: string;
  periodEnd: string;
  activities: PlaneActivity[];
};

export type Post = PostContent & {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: PostStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  manuallyEdited: boolean;
};

export type Revision = {
  version: number;
  actor: string;
  kind: "generated" | "manual";
  createdAt: string;
  snapshot: Post;
};

export type PostDetail = {
  post: Post;
  originalGeneratedContent: Submission;
  revisions: Revision[];
  activities: PlaneActivity[];
};

export type EditPost = PostContent & { version: number; status: PostStatus };

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}
