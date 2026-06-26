import { useState } from 'react';
import { ArrowLeft, Calendar, User, Tag, Search, ArrowRight, Clock } from 'lucide-react';
import { NEWS_ARTICLES, NewsArticle } from '../../data/newsData';

const CATEGORIES = ['ALL', 'PRESS RELEASE', 'CAMPAIGN', 'POLICY', 'ANNOUNCEMENT'];

function ArticleView({ article, onBack }: { article: NewsArticle; onBack: () => void }) {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '64px 16px 96px' }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', marginBottom: '40px', padding: 0 }}
      >
        <ArrowLeft style={{ width: '15px', height: '15px' }} /> BACK TO NEWS
      </button>

      {/* Category + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <span style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: '#dc2626', fontSize: '11px', padding: '4px 12px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em' }}>
          {article.category}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#4b5563' }}>
          <Calendar style={{ width: '12px', height: '12px' }} /> {article.date}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#4b5563' }}>
          <User style={{ width: '12px', height: '12px' }} /> {article.author}
        </span>
      </div>

      {/* Title */}
      <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.15, letterSpacing: '0.03em', color: '#fff', marginBottom: '32px' }}>
        {article.title}
      </h1>

      {/* Hero image */}
      <div style={{ marginBottom: '40px', overflow: 'hidden' }}>
        <img
          src={article.image}
          alt={article.title}
          style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Excerpt / lead */}
      <p style={{ fontSize: '17px', lineHeight: 1.85, color: '#d1d5db', borderLeft: '3px solid #dc2626', paddingLeft: '20px', marginBottom: '36px', fontStyle: 'italic' }}>
        {article.excerpt}
      </p>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #1f1f1f', marginBottom: '36px' }} />

      {/* Body paragraphs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {article.body.map((para, i) => (
          <p key={i} style={{ fontSize: '15px', lineHeight: 1.9, color: '#c0c0c0', margin: 0 }}>
            {para}
          </p>
        ))}
      </div>

      {/* Footer tag */}
      <div style={{ marginTop: '56px', paddingTop: '24px', borderTop: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Tag style={{ width: '13px', height: '13px', color: '#dc2626' }} />
        <span style={{ fontSize: '12px', color: '#4b5563', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>{article.category} · {article.date} · {article.author}</span>
      </div>
    </div>
  );
}

function ArticleCard({ article, onRead, featured }: { article: NewsArticle; onRead: () => void; featured?: boolean }) {
  const [hovered, setHovered] = useState(false);

  if (featured) {
    return (
      <div
        onClick={onRead}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer', backgroundColor: '#0d0d0d', border: `1px solid ${hovered ? '#dc2626' : '#1f1f1f'}`, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', transition: 'border-color 0.2s' }}
      >
        <div style={{ overflow: 'hidden', maxHeight: '400px' }}>
          <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.5s' }} />
        </div>
        <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: '10px', padding: '3px 10px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em' }}>FEATURED</span>
            <span style={{ backgroundColor: 'rgba(220,38,38,0.12)', color: '#dc2626', fontSize: '10px', padding: '3px 10px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em' }}>{article.category}</span>
            <span style={{ fontSize: '11px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '10px', height: '10px' }} />{article.date}</span>
          </div>
          <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', letterSpacing: '0.03em', color: '#fff', lineHeight: 1.2, marginBottom: '16px' }}>
            {article.title}
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#6b7280', marginBottom: '24px' }}>{article.excerpt}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>
            READ FULL ARTICLE <ArrowRight style={{ width: '13px', height: '13px' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onRead}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', backgroundColor: '#0d0d0d', border: `1px solid ${hovered ? '#dc2626' : '#1f1f1f'}`, overflow: 'hidden', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ overflow: 'hidden', height: '210px' }}>
        <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.5s' }} />
      </div>
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ backgroundColor: 'rgba(220,38,38,0.12)', color: '#dc2626', fontSize: '10px', padding: '3px 9px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{article.category}</span>
          <span style={{ fontSize: '11px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '10px', height: '10px' }} />{article.date}</span>
        </div>
        <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem', letterSpacing: '0.04em', color: '#fff', lineHeight: 1.3, marginBottom: '12px', flex: 1 }}>
          {article.title}
        </h3>
        <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#6b7280', marginBottom: '20px' }}>{article.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#dc2626', fontSize: '12px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>
          READ MORE <ArrowRight style={{ width: '12px', height: '12px' }} />
        </div>
      </div>
    </div>
  );
}

export function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [openArticle, setOpenArticle] = useState<NewsArticle | null>(null);

  const filtered = NEWS_ARTICLES.filter(a => {
    const matchCat = activeCategory === 'ALL' || a.category === activeCategory;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  if (openArticle) {
    return (
      <div style={{ backgroundColor: '#080808', fontFamily: 'Open Sans, sans-serif', color: '#fff', minHeight: '100vh' }}>
        {/* Article hero bar */}
        <div style={{ backgroundColor: '#007A30', borderBottom: '1px solid #005020', padding: '16px' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#4b5563', fontFamily: 'Oswald, sans-serif', margin: 0 }}>
              NEWS / {openArticle.category}
            </p>
          </div>
        </div>
        <ArticleView article={openArticle} onBack={() => setOpenArticle(null)} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#080808', fontFamily: 'Open Sans, sans-serif', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '96px 16px 64px', overflow: 'hidden', background: 'linear-gradient(135deg, #007A30 0%, #006B28 40%, #1a0000 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(220,38,38,0.10) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.22em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 600, marginBottom: '14px' }}>BUILD ONE ZAMBIA</p>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.4rem, 6vw, 4rem)', lineHeight: 1.08, letterSpacing: '0.03em', marginBottom: '20px' }}>
            LATEST <span style={{ color: '#dc2626' }}>NEWS</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: 1.85, maxWidth: '520px', margin: '0 auto 40px' }}>
            Stay informed with press releases, campaign updates, policy announcements, and news from across the Build One Zambia movement.
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#4b5563' }} />
            <input
              type="text"
              placeholder="Search news…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '13px 16px 13px 44px', backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'Open Sans, sans-serif' }}
            />
          </div>
        </div>
      </section>

      {/* Category filter */}
      <div style={{ backgroundColor: '#007A30', borderBottom: '1px solid #005020', overflowX: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', gap: '0' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: 'none', border: 'none', borderBottom: `2px solid ${activeCategory === cat ? '#dc2626' : 'transparent'}`,
                color: activeCategory === cat ? '#dc2626' : '#6b7280',
                padding: '16px 20px', fontFamily: 'Oswald, sans-serif', fontSize: '12px',
                letterSpacing: '0.1em', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      <section style={{ padding: '56px 16px 96px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 16px', color: '#4b5563' }}>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.2rem', letterSpacing: '0.06em' }}>No articles found.</p>
            </div>
          )}

          {/* Featured */}
          {featured && (
            <div style={{ marginBottom: '32px' }}>
              <ArticleCard article={featured} onRead={() => setOpenArticle(featured)} featured />
            </div>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {rest.map(article => (
                <ArticleCard key={article.id} article={article} onRead={() => setOpenArticle(article)} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

export default NewsPage;
