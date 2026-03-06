import React from "react";
import { Link } from "react-router-dom";

function Blog() {
  const featuredStory = {
    title: "Weekend Streetwear Edit: 7 Looks That Always Work",
    excerpt:
      "From clean tees to statement accessories, these combinations balance comfort and style for everyday Lagos movement.",
    image:
      "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=1200",
    readTime: "6 min read",
    category: "Style Guide",
  };

  const stories = [
    {
      title: "New Men Drop: Oversized Tees, Cargos, and Fresh Sneakers",
      excerpt: "A compact guide to this week's men collection and what to pair first.",
      image:
        "https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=1200",
      category: "New Drops",
      date: "March 2026",
      link: "/?q=men",
    },
    {
      title: "Women Spotlight: Dresses and Bags for Day-to-Night Looks",
      excerpt: "Simple combinations that move from work hours to evening plans.",
      image:
        "https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg?auto=compress&cs=tinysrgb&w=1200",
      category: "Women",
      date: "March 2026",
      link: "/?q=women",
    },
    {
      title: "Accessory Guide: Watches, Sunglasses, and Everyday Essentials",
      excerpt: "Small details that level up basic outfits without overdoing it.",
      image:
        "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=1200",
      category: "Accessories",
      date: "March 2026",
      link: "/?q=accessories",
    },
    {
      title: "How to Choose the Right Fit Before Checkout",
      excerpt: "Use this quick fit checklist to reduce returns and buy with confidence.",
      image:
        "https://images.pexels.com/photos/5693893/pexels-photo-5693893.jpeg?auto=compress&cs=tinysrgb&w=1200",
      category: "Tips",
      date: "March 2026",
      link: "/",
    },
  ];

  const journalTags = ["New Drops", "Men", "Women", "Accessories", "How-To", "Style Guide"];

  return (
    <div className="container-app space-y-8">
      <section className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--accent)]">CyberStore Journal</p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-5xl">Style Stories & New Drops</h1>
        <p className="mt-4 max-w-2xl text-sm text-[color:var(--text-muted)] md:text-base">
          Fashion guides, product launch stories, and seasonal styling edits that link directly to products you can shop now.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {journalTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold text-[color:var(--text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/?q=men" className="btn-primary">Shop Men</Link>
          <Link to="/?q=women" className="btn-secondary">Shop Women</Link>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]">
          <img src={featuredStory.image} alt={featuredStory.title} className="h-64 w-full object-cover md:h-80" />
          <div className="p-5 md:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--accent)]">
              Featured Story
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{featuredStory.title}</h2>
            <p className="mt-3 text-sm text-[color:var(--text-muted)] md:text-base">{featuredStory.excerpt}</p>
            <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-[color:var(--text-muted)]">
              <span>{featuredStory.category}</span>
              <span>•</span>
              <span>{featuredStory.readTime}</span>
            </div>
          </div>
        </article>

        <aside className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 md:p-6">
          <h3 className="text-xl font-black uppercase tracking-tight">Shop This Look</h3>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            Jump from story to store with curated quick links.
          </p>
          <div className="mt-4 grid gap-2">
            <Link to="/?q=men" className="btn-secondary justify-start">Men Streetwear Picks</Link>
            <Link to="/?q=women" className="btn-secondary justify-start">Women New Arrivals</Link>
            <Link to="/?q=accessories" className="btn-secondary justify-start">Accessories Essentials</Link>
            <Link to="/#products" className="btn-primary justify-start">Browse All Products</Link>
          </div>
        </aside>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black uppercase tracking-tight">Latest Stories</h3>
          <Link to="/" className="text-sm font-semibold text-[color:var(--accent)]">Back to Shop</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stories.map((story) => (
            <article
              key={story.title}
              className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]"
            >
              <img src={story.image} alt={story.title} className="h-44 w-full object-cover" />
              <div className="space-y-2 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--accent)]">
                  {story.category}
                </p>
                <h4 className="line-clamp-2 text-base font-semibold leading-5">{story.title}</h4>
                <p className="line-clamp-2 text-sm text-[color:var(--text-muted)]">{story.excerpt}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[color:var(--text-muted)]">{story.date}</span>
                  <Link to={story.link} className="text-sm font-semibold text-[color:var(--accent)]">
                    Read & Shop →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Blog;
