import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, Users, Shield, AlertTriangle } from 'lucide-react';
import FAQ from '../Components/FAQ';
import Chatbot from '../Components/Chatbot';

const POSHExplainer = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    {
      id: 'overview',
      title: 'POSH Act Overview',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">What is the POSH Act?</h3>
          <p className="text-gray-700 leading-relaxed">
            The Prevention of Sexual Harassment (POSH) Act, 2013 is a legislative act in India that seeks to protect women from sexual harassment at their place of work. It was passed by the Lok Sabha on 3 September 2012 and by the Rajya Sabha on 26 February 2013.
          </p>
          
          <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
            <h4 className="font-semibold text-red-800 mb-2">Key Objectives:</h4>
            <ul className="text-red-700 space-y-2">
              <li>• Provide protection against sexual harassment of women at workplace</li>
              <li>• Provide for prevention and redressal of complaints</li>
              <li>• Ensure safe working environment for women</li>
              <li>• Build employee confidence through grievance handling</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">Coverage</h4>
              <p className="text-blue-700">All workplaces with 10 or more employees must comply with POSH Act provisions.</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">Applicability</h4>
              <p className="text-green-700">Applies to organized and unorganized sectors, public and private.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'definitions',
      title: 'Understanding Sexual Harassment',
      icon: AlertTriangle,
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">What Constitutes Sexual Harassment?</h3>
          
          <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
            <p className="text-yellow-800 mb-4">
              Sexual harassment includes any unwelcome act or behavior (whether directly or by implication) such as:
            </p>
            <ul className="text-yellow-700 space-y-2">
              <li>• Physical contact and advances</li>
              <li>• Demand or request for sexual favors</li>
              <li>• Making sexually colored remarks</li>
              <li>• Showing pornography</li>
              <li>• Any other unwelcome physical, verbal or non-verbal conduct of sexual nature</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <h4 className="font-semibold text-red-800 mb-3">Physical</h4>
              <p className="text-red-700 text-sm">Unwelcome physical contact, advances, or gestures</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg text-center">
              <h4 className="font-semibold text-orange-800 mb-3">Verbal</h4>
              <p className="text-orange-700 text-sm">Sexually colored remarks, jokes, or comments</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <h4 className="font-semibold text-purple-800 mb-3">Non-verbal</h4>
              <p className="text-purple-700 text-sm">Showing pornography, lewd gestures, or staring</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'committees',
      title: 'Internal Committees',
      icon: Users,
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Internal Committee (IC) Structure</h3>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">Mandatory Committee Composition:</h4>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <h5 className="font-medium text-blue-700 mb-2">Presiding Officer</h5>
                <p className="text-blue-600 text-sm">Senior woman employee (if not available, then senior woman from other office)</p>
              </div>
              <div>
                <h5 className="font-medium text-blue-700 mb-2">Members</h5>
                <ul className="text-blue-600 text-sm space-y-1">
                  <li>• Two employees committed to women's cause</li>
                  <li>• One external NGO member</li>
                  <li>• At least half should be women</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3">Committee Responsibilities:</h4>
            <ul className="text-green-700 space-y-2">
              <li>• Receive and investigate complaints</li>
              <li>• Conduct inquiry in prescribed manner</li>
              <li>• Submit report within 90 days</li>
              <li>• Recommend action to employer</li>
              <li>• Maintain confidentiality</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'complaint',
      title: 'Filing a Complaint',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">How to File a Complaint</h3>
          
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-3">Timeline: Within 3 months of incident</h4>
            <p className="text-red-700">Extension possible in exceptional circumstances with reasons in writing</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-gray-800">Step-by-Step Process:</h4>
            
            <div className="space-y-4">
              {[
                { step: 1, title: 'File Written Complaint', desc: 'Submit detailed complaint to Internal Committee' },
                { step: 2, title: 'Acknowledgment', desc: 'Committee acknowledges receipt within 7 days' },
                { step: 3, title: 'Inquiry Process', desc: 'Committee conducts fair inquiry within 90 days' },
                { step: 4, title: 'Report Submission', desc: 'Committee submits findings and recommendations' },
                { step: 5, title: 'Action Implementation', desc: 'Employer implements recommended actions' },
              ].map((item) => (
                <div key={item.step} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {item.step}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{item.title}</h5>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-3">Important Rights:</h4>
            <ul className="text-purple-700 space-y-2">
              <li>• Right to confidentiality</li>
              <li>• Right to interim relief</li>
              <li>• Right to counseling</li>
              <li>• Protection from retaliation</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            POSH Law Complete Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about the Prevention of Sexual Harassment Act, 2013
          </p>
        </motion.div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-md'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  {section.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mb-12">
          {sections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: activeSection === section.id ? 1 : 0,
                height: activeSection === section.id ? 'auto' : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {activeSection === section.id && (
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                  {section.content}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <FAQ />

        {/* Chatbot Section */}
        <Chatbot />
      </div>
    </div>
  );
};

export default POSHExplainer;
  