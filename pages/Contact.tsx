
import React from 'react';
import { InquiryForm } from '../components/InquiryForm';
import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-4">Request a Quote</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Our technical sales engineers are ready to assist you with component specifications, bulk pricing, and custom supply chain solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Details */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Corporate Headquarters</h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Address</h4>
                    <p className="text-slate-600 text-sm leading-relaxed mt-1">
                      Plot 422, Industrial Zone G, <br />
                      Vadodara, Gujarat 390010, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Direct Contact</h4>
                    <p className="text-slate-600 text-sm mt-1">Sales: +91 98765 43210</p>
                    <p className="text-slate-600 text-sm">Tech Support: +91 98765 00000</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Email Support</h4>
                    <p className="text-slate-600 text-sm mt-1">sales@indusedge.com</p>
                    <p className="text-slate-600 text-sm">support@indusedge.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Office Hours</h4>
                    <p className="text-slate-600 text-sm mt-1">Mon - Sat: 9:00 AM - 7:00 PM</p>
                    <p className="text-slate-600 text-sm">Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <div className="flex items-center space-x-2 text-blue-600 font-bold mb-4">
                  <Globe className="h-5 w-5" />
                  <span>Global Export Available</span>
                </div>
                <p className="text-xs text-slate-500">
                  We export to over 25 countries including USA, Germany, UAE, and Singapore.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-md border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us an Inquiry</h3>
              <InquiryForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
