import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import {
  Wrench,
  Box,
  Building2,
  FileText,
  PenSquare,
  Users,
  UserCog,
  ArrowRight,
  Briefcase,
  FolderKanban,
  Receipt,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatCard {
  label: string;
  href: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

interface RecentPost {
  title: string;
  author_name: string;
  published_at: string | null;
  status: string;
  slug: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'published':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'draft':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'archived':
      return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    default:
      return 'bg-zinc-100 text-zinc-600 border-zinc-200';
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800 font-medium">Supabase is not configured.</p>
          <p className="text-amber-600 text-sm mt-1">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.</p>
        </div>
      </div>
    );
  }

  const [
    servicesRes, productsRes, industriesRes, caseStudiesRes,
    blogPostsRes, authorsRes, teamRes, recentPostsRes,
    clientsRes, projectsRes, invoicesRes,
  ] = await Promise.all([
    supabase.from('services').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('industries').select('id', { count: 'exact', head: true }),
    supabase.from('case_studies').select('id', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
    supabase.from('authors').select('id', { count: 'exact', head: true }),
    supabase.from('team_members').select('id', { count: 'exact', head: true }),
    supabase
      .from('blog_posts')
      .select('title, slug, status, published_at, authors(name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('invoices').select('id', { count: 'exact', head: true }),
  ]);

  const stats: StatCard[] = [
    {
      label: 'Clients',
      href: '/clients',
      icon: <Briefcase className="size-5" />,
      count: clientsRes.count ?? 0,
      color: 'text-[#115FC9] bg-blue-50',
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: <FolderKanban className="size-5" />,
      count: projectsRes.count ?? 0,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      label: 'Invoices',
      href: '/invoices',
      icon: <Receipt className="size-5" />,
      count: invoicesRes.count ?? 0,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Total Services',
      href: '/services',
      icon: <Wrench className="size-5" />,
      count: servicesRes.count ?? 0,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Total Products',
      href: '/products',
      icon: <Box className="size-5" />,
      count: productsRes.count ?? 0,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      label: 'Total Industries',
      href: '/industries',
      icon: <Building2 className="size-5" />,
      count: industriesRes.count ?? 0,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Total Case Studies',
      href: '/case-studies',
      icon: <FileText className="size-5" />,
      count: caseStudiesRes.count ?? 0,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      label: 'Total Blog Posts',
      href: '/blog',
      icon: <PenSquare className="size-5" />,
      count: blogPostsRes.count ?? 0,
      color: 'text-sky-600 bg-sky-50',
    },
    {
      label: 'Total Authors',
      href: '/authors',
      icon: <Users className="size-5" />,
      count: authorsRes.count ?? 0,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      label: 'Total Team Members',
      href: '/team',
      icon: <UserCog className="size-5" />,
      count: teamRes.count ?? 0,
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  const recentPosts: RecentPost[] = (recentPostsRes.data ?? []).map((post: Record<string, unknown>) => ({
    title: post.title as string,
    author_name: (post.authors as Record<string, unknown> | null)?.name as string ?? 'Unknown',
    published_at: post.published_at as string | null,
    status: post.status as string,
    slug: post.slug as string,
  }));

  return (
    <div className="space-y-6">
      <section aria-label="Content statistics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group block bg-white rounded-xl border border-zinc-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2.5 ${stat.color}`}>{stat.icon}</div>
                <ArrowRight className="size-4 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-zinc-900">{stat.count}</div>
                <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Recent blog posts">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="text-base font-semibold text-zinc-900">Recent Blog Posts</h2>
            <Link href="/blog" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">View all</Link>
          </div>
          {recentPosts.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-400">No published blog posts yet.</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentPosts.map((post) => (
                <div key={post.slug} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-zinc-900 truncate">{post.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{post.author_name} · {formatDate(post.published_at)}</div>
                  </div>
                  <Badge variant="outline" className={`shrink-0 text-xs capitalize ${statusBadgeVariant(post.status)}`}>{post.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
