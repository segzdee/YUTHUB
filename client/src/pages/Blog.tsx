import React from 'react';
import { PublicPageLayout } from '../components/PageLayout';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog: React.FC = () => {
  const posts = [
    {
      title: 'How We Reduced Admin Time by 70% at Manchester Youth Housing',
      excerpt: 'A case study on how digital transformation helped one organization redirect resources from paperwork to people.',
      author: 'Sarah Mitchell',
      date: '2025-01-15',
      readTime: '5 min read',
      category: 'Case Studies',
      image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'Understanding the New Ofsted Inspection Framework for Supported Housing',
      excerpt: 'What providers need to know about the updated inspection criteria and how to prepare.',
      author: 'Dr. Emily Roberts',
      date: '2025-01-10',
      readTime: '8 min read',
      category: 'Compliance',
      image: 'https://images.pexels.com/photos/8111825/pexels-photo-8111825.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: '5 Ways Technology Improves Outcomes for Care Leavers',
      excerpt: 'Evidence-based insights on how digital tools support better transitions to independent living.',
      author: 'James Chen',
      date: '2025-01-05',
      readTime: '6 min read',
      category: 'Impact',
      image: 'https://images.pexels.com/photos/3184434/pexels-photo-3184434.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'Building a Trauma-Informed Digital Platform',
      excerpt: 'The design principles we follow to ensure YUTHUB supports vulnerable young people sensitively.',
      author: 'Michael Thompson',
      date: '2024-12-28',
      readTime: '7 min read',
      category: 'Product',
      image: 'https://images.pexels.com/photos/5427863/pexels-photo-5427863.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'Data Security in Youth Housing: A Comprehensive Guide',
      excerpt: 'Understanding GDPR, data protection, and best practices for safeguarding sensitive information.',
      author: 'Sarah Mitchell',
      date: '2024-12-20',
      readTime: '10 min read',
      category: 'Security',
      image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'The Future of Youth Housing: Trends for 2025',
      excerpt: 'Exploring emerging challenges and opportunities in the supported housing sector.',
      author: 'Dr. Emily Roberts',
      date: '2024-12-15',
      readTime: '9 min read',
      category: 'Industry',
      image: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  const categories = ['All', 'Case Studies', 'Compliance', 'Impact', 'Product', 'Security', 'Industry'];

  return (
    <PublicPageLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-800 text-black leading-tight">
              YUTHUB Blog
            </h1>
            <p className="text-xl sm:text-2xl font-400 text-gray-700 max-w-3xl mx-auto">
              Insights, best practices, and stories from the youth housing sector
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, idx) => (
              <button
                key={idx}
                className={`px-4 py-2 rounded-lg font-500 transition-colors ${
                  idx === 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Post */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-64 lg:h-auto">
                <img
                  src={posts[0].image}
                  alt={posts[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-600 rounded-full">
                    Featured
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-600 rounded-full">
                    {posts[0].category}
                  </span>
                </div>
                <h2 className="text-3xl font-700 text-black mb-4 leading-tight">
                  {posts[0].title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {posts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {posts[0].date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {posts[0].readTime}
                  </span>
                </div>
                <button className="inline-flex items-center gap-2 text-blue-600 font-600 hover:gap-3 transition-all">
                  Read full article
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <h2 className="text-3xl font-700 text-black mb-12">Recent Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post, idx) => (
              <article
                key={idx}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-600 text-blue-600">{post.category}</span>
                  </div>
                  <h3 className="text-xl font-600 text-black mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-white p-12 rounded-2xl border border-blue-200 text-center">
            <h2 className="text-3xl font-700 text-black mb-4">Stay Updated</h2>
            <p className="text-lg text-gray-600 mb-8">
              Get the latest insights and best practices delivered to your inbox monthly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </div>
    </PublicPageLayout>
  );
};

export default Blog;
