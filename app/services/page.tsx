import React from 'react';
import ServicesList from '@/components/services-list';

const ServicesPage = () => {

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-medium text-pink-600 mb-6 tracking-tight">
              Our Services
            </h1>
            <div className="w-24 h-px bg-pink-600 mx-auto mb-8"></div>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed font-light">
              Discover our curated collection of beauty services, each designed to enhance your natural radiance
              with expert techniques and premium products.
            </p>
          </div>

          <ServicesList />
        </div>
      </main>
    </div>
  );
};

export default ServicesPage;