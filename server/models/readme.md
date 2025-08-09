This folder contains all MongoDB/Mongoose models used by the Next.js app.
They’re designed for anon-first posting (Blind-style) with clean, index-friendly reads.

Files
/src/server/models
├── Organization.ts
├── Membership.ts
├── Post.ts
├── Comment.ts
├── Reaction.ts
├── Review.ts
├── Salary.ts
└── Report.ts
Note: The Go auth service owns users (account data). In Next, we work with userId (from JWT) and membershipId (per-org identity).

Big picture (ER diagram)

  Organization ||--o{ Membership : "orgId"
  User ||--o{ Membership : "userId"
  Membership ||--o{ Post : "authorMembershipId"
  Membership ||--o{ Comment : "authorMembershipId"
  Organization ||--o{ Post : "orgId"
  Organization ||--o{ Comment : "orgId"
  Organization ||--o{ Review : "orgId"
  Organization ||--o{ Salary : "orgId"
  Post ||--o{ Comment : "postId"
  Post ||--o{ Reaction : "postId"
  User ||--o{ Reaction : "userId"
Organization: company/college (created by enrichment).

User: account (stored by Go). Not modeled here unless needed.

Membership: link user ↔ organization + anonymous displayHandle.

Post/Comment: authored via Membership; show authorHandleSnapshot.

Reaction: user likes a post (unique per user/post).

Review/Salary: company-specific submissions (membership required).

Report: user reports content for moderation.

Model summaries
Organization
    Fields: slug (unique), name, domain (unique), type ("corporate"|"college"), logoUrl, timestamps.

    Indexes: slug (unique), domain (unique), type.

    Created by: Next enrichment service when a new domain appears.

Membership
    Fields: userId, orgId, displayHandle, role ("member"|"mod"|"admin"), timestamps.

    Unique: (userId, orgId) → one membership per org per user.

    Purpose: anonymous identity per org; used as the author on posts/comments.

    Created by: Go service on signup/login (idempotent upsert).

Post
    Fields: orgId, companyId?, category ("general"|"career"|"compensation"|"culture"), title, body,
    authorMembershipId, authorHandleSnapshot, counters (likeCount, commentCount, viewCount), tags[]?, isDeleted, timestamps.

    Indexes: {orgId, createdAt:-1}, {companyId, createdAt:-1}, {category, orgId, createdAt:-1}.

    Notes: store authorHandleSnapshot at creation to keep display stable if handle changes.

Comment
    Fields: postId, orgId, authorMembershipId, authorHandleSnapshot, body, isDeleted, timestamps.

    Indexes: {postId, createdAt:1}, {orgId, createdAt:-1}.

Reaction (Like)
    Fields: postId, userId, orgId, createdAt.

    Unique: {postId, userId} (one like per user per post).

    Flow: insert on like (+ $inc post.likeCount); delete on unlike (– $inc).

Review (Company reviews)
    Fields: orgId, authorMembershipId, facet ratings (1–5), title?, pros, cons, isDeleted, timestamps.

    Indexes: {orgId, createdAt:-1}.

    Optional: unique {orgId, authorMembershipId} to allow only one review per member.

Salary
    Fields: orgId, authorMembershipId, title, level?, location?, yoe, base, bonus?, stockValue?, currency ("USD" default), isDeleted, timestamps.

    Indexes: {orgId, title, level}, {orgId, createdAt:-1}.

Report
    Fields: orgId, targetType ("post"|"comment"|"review"|"salary"), targetId, reporterMembershipId, reason, status ("open"|"reviewing"|"resolved"|"rejected"), resolutionNote?, timestamps.

    Indexes: {orgId, createdAt:-1}, {targetType, targetId}.

Why Membership exists (and why not arrays on User)
Anonymity: posts/comments show displayHandle, not user IDs.

Scaling: one-to-many actions live in their own collections with proper indexes (no giant arrays on User).

Multi-org: a user can belong to many orgs over time; each gets its own handle & role.

Common queries (shape ↔ index)
Org feed
Post.find({ orgId, isDeleted:false }).sort({ createdAt:-1 }).limit(20)
→ uses { orgId, createdAt }.

Company feed
Post.find({ companyId }).sort({ createdAt:-1 }).

Post detail + comments
Post.findById(_id) and Comment.find({ postId }).sort({ createdAt:1 }).limit(50)
→ uses { postId, createdAt }.

Toggle like
Insert into Reaction with unique { postId, userId }; $inc Post.likeCount on success.
Delete and $inc: -1 on unlike.

My posts / comments
Resolve membershipId from JWT;
Post.find({ authorMembershipId }).sort({ createdAt:-1 })
Comment.find({ authorMembershipId }).sort({ createdAt:-1 }).

Company reviews
Review.find({ orgId }).sort({ createdAt:-1 }); aggregate averages by org.

Salary browse
Salary.find({ orgId, title?, level?, location? }).sort({ createdAt:-1 }); precompute percentiles or compute on demand.

Invariants & conventions
Soft delete content with isDeleted=true; exclude in queries.

Snapshot authorHandleSnapshot on Post/Comment create.

Idempotency: Membership upsert is unique on (userId, orgId).

Counters: update counts (likeCount, commentCount) in the same transaction as the write; reconcile job can run later if needed.

Validation: enforce enums and sensible text limits at the schema layer.

Where to put things
DB connector: src/server/db/index.ts

Models: one file per model in src/server/models/

Auth session: JWT verification & cookie helpers in src/server/auth/

API routes (App Router): e.g.

Feed: src/app/api/orgs/[slug]/feed/route.ts

Create post: src/app/api/orgs/[slug]/posts/route.ts

Post detail: src/app/api/posts/[id]/route.ts

Comments: src/app/api/posts/[id]/comments/route.ts

Like: src/app/api/posts/[id]/like/route.ts

Reviews/Salaries: src/app/api/companies/[slug]/...

Always await dbConnect() at the top of each route handler before using models.

Security & auth notes
JWT claims from Go: { sub: userIdHex, org: orgSlug, mid: membershipIdHex }.

On write routes, verify:

membership exists and belongs to sub and org.

user has permission (role on membership).

Never expose internal IDs for users; the client sees handles + snapshots only.