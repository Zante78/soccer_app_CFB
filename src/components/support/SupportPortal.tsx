import React from 'react';
import { useTranslation } from '../../i18n/hooks/useTranslation';
import { FAQSection } from './FAQSection';
import { TicketList } from './TicketList';
import { CreateTicketForm } from './CreateTicketForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { HelpCircle, Ticket, MessageSquare } from 'lucide-react';

export function SupportPortal() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('support.portal.title')}
      </h1>

      <Tabs defaultValue="faq">
        <TabsList>
          <TabsTrigger value="faq">
            <HelpCircle className="w-4 h-4 mr-2" />
            {t('support.tabs.faq')}
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <Ticket className="w-4 h-4 mr-2" />
            {t('support.tabs.tickets')}
          </TabsTrigger>
          <TabsTrigger value="contact">
            <MessageSquare className="w-4 h-4 mr-2" />
            {t('support.tabs.contact')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <FAQSection />
        </TabsContent>

        <TabsContent value="tickets">
          <TicketList />
        </TabsContent>

        <TabsContent value="contact">
          <CreateTicketForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}