import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/hooks/useTranslation';
import { SupportService } from '../../services/support.service';
import { FAQEntry } from '../../types/core/support';
import { Search } from 'lucide-react';

const supportService = new SupportService();

export function FAQSection() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const data = await supportService.getFAQs();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      const results = await supportService.searchKnowledgeBase(query);
      setFaqs(results);
    } else if (query.length === 0) {
      loadFAQs();
    }
  };

  if (loading) {
    return <div className="animate-pulse">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('support.faq.searchPlaceholder')}
          className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50">
              <span className="font-medium text-gray-900">{faq.question}</span>
            </summary>
            <div className="px-4 py-3 border-t border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}