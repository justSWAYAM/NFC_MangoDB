import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, Users, Shield, AlertTriangle, Globe } from 'lucide-react';
import FAQ from '../Components/FAQ';
import Chatbot from '../Components/Chatbot';

const POSHExplainer = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [language, setLanguage] = useState('en'); // 'en' for English, 'hi' for Hindi

  // Bilingual content
  const content = {
    en: {
      sections: [
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
      ],
    },
    hi: {
      sections: [
        {
          id: 'overview',
          title: 'पॉश अधिनियम का अवलोकन',
          icon: BookOpen,
          content: (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">पॉश अधिनियम क्या है?</h3>
              <p className="text-gray-700 leading-relaxed">
                यौन उत्पीड़न निवारण (पॉश) अधिनियम, 2013 भारत में एक विधायी अधिनियम है जो कार्यस्थल पर महिलाओं को यौन उत्पीड़न से बचाने का प्रयास करता है। इसे लोकसभा द्वारा 3 सितंबर 2012 को और राज्यसभा द्वारा 26 फरवरी 2013 को पारित किया गया था।
              </p>
              
              <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-red-800 mb-2">मुख्य उद्देश्य:</h4>
                <ul className="text-red-700 space-y-2">
                  <li>• कार्यस्थल पर महिलाओं के यौन उत्पीड़न से सुरक्षा प्रदान करना</li>
                  <li>• शिकायतों की रोकथाम और निवारण के लिए प्रावधान</li>
                  <li>• महिलाओं के लिए सुरक्षित कार्य वातावरण सुनिश्चित करना</li>
                  <li>• शिकायत निवारण के माध्यम से कर्मचारी आत्मविश्वास बनाना</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">दायरा</h4>
                  <p className="text-blue-700">10 या अधिक कर्मचारियों वाले सभी कार्यस्थलों को पॉश अधिनियम के प्रावधानों का पालन करना होगा।</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">लागूता</h4>
                  <p className="text-green-700">संगठित और असंगठित क्षेत्रों, सार्वजनिक और निजी दोनों पर लागू होता है।</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: 'definitions',
          title: 'यौन उत्पीड़न की समझ',
          icon: AlertTriangle,
          content: (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">यौन उत्पीड़न क्या है?</h3>
              
              <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                <p className="text-yellow-800 mb-4">
                  यौन उत्पीड़न में कोई भी अवांछित कार्य या व्यवहार शामिल है (चाहे सीधे या अप्रत्यक्ष रूप से) जैसे:
                </p>
                <ul className="text-yellow-700 space-y-2">
                  <li>• शारीरिक संपर्क और प्रगति</li>
                  <li>• यौन अनुग्रह की मांग या अनुरोध</li>
                  <li>• यौन रंग के टिप्पणियां करना</li>
                  <li>• अश्लील साहित्य दिखाना</li>
                  <li>• यौन प्रकृति का कोई अन्य अवांछित शारीरिक, मौखिक या गैर-मौखिक आचरण</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <h4 className="font-semibold text-red-800 mb-3">शारीरिक</h4>
                  <p className="text-red-700 text-sm">अवांछित शारीरिक संपर्क, प्रगति, या इशारे</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg text-center">
                  <h4 className="font-semibold text-orange-800 mb-3">मौखिक</h4>
                  <p className="text-orange-700 text-sm">यौन रंग के टिप्पणियां, चुटकुले, या टिप्पणियां</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <h4 className="font-semibold text-purple-800 mb-3">गैर-मौखिक</h4>
                  <p className="text-purple-700 text-sm">अश्लील साहित्य दिखाना, अश्लील इशारे, या घूरना</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: 'committees',
          title: 'आंतरिक समितियां',
          icon: Users,
          content: (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">आंतरिक समिति (आईसी) संरचना</h3>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">अनिवार्य समिति संरचना:</h4>
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">अध्यक्ष अधिकारी</h5>
                    <p className="text-blue-600 text-sm">वरिष्ठ महिला कर्मचारी (यदि उपलब्ध नहीं है, तो अन्य कार्यालय से वरिष्ठ महिला)</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">सदस्य</h5>
                    <ul className="text-blue-600 text-sm space-y-1">
                      <li>• महिलाओं के कारण के लिए प्रतिबद्ध दो कर्मचारी</li>
                      <li>• एक बाहरी एनजीओ सदस्य</li>
                      <li>• कम से कम आधे महिलाएं होनी चाहिए</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">समिति की जिम्मेदारियां:</h4>
                <ul className="text-green-700 space-y-2">
                  <li>• शिकायतें प्राप्त करना और जांच करना</li>
                  <li>• निर्धारित तरीके से जांच आयोजित करना</li>
                  <li>• 90 दिनों के भीतर रिपोर्ट प्रस्तुत करना</li>
                  <li>• नियोक्ता को कार्रवाई की सिफारिश करना</li>
                  <li>• गोपनीयता बनाए रखना</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: 'complaint',
          title: 'शिकायत दर्ज करना',
          icon: Shield,
          content: (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">शिकायत कैसे दर्ज करें</h3>
              
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-3">समय सीमा: घटना के 3 महीने के भीतर</h4>
                <p className="text-red-700">असाधारण परिस्थितियों में लिखित कारणों के साथ विस्तार संभव</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-800">चरण-दर-चरण प्रक्रिया:</h4>
                
                <div className="space-y-4">
                  {[
                    { step: 1, title: 'लिखित शिकायत दर्ज करें', desc: 'आंतरिक समिति को विस्तृत शिकायत प्रस्तुत करें' },
                    { step: 2, title: 'पावती', desc: 'समिति 7 दिनों के भीतर प्राप्ति की पावती देती है' },
                    { step: 3, title: 'जांच प्रक्रिया', desc: 'समिति 90 दिनों के भीतर निष्पक्ष जांच आयोजित करती है' },
                    { step: 4, title: 'रिपोर्ट प्रस्तुत', desc: 'समिति निष्कर्ष और सिफारिशें प्रस्तुत करती है' },
                    { step: 5, title: 'कार्रवाई कार्यान्वयन', desc: 'नियोक्ता अनुशंसित कार्रवाई लागू करता है' },
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
                <h4 className="font-semibold text-purple-800 mb-3">महत्वपूर्ण अधिकार:</h4>
                <ul className="text-purple-700 space-y-2">
                  <li>• गोपनीयता का अधिकार</li>
                  <li>• अंतरिम राहत का अधिकार</li>
                  <li>• परामर्श का अधिकार</li>
                  <li>प्रतिशोध से सुरक्षा</li>
                </ul>
              </div>
            </div>
          ),
        },
      ],
    },
  };

  const sections = content[language].sections;

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: language === 'hi' ? '"Noto Sans Devanagari", "Arial Unicode MS", sans-serif' : 'inherit' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Language Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg shadow-md p-1 flex">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  language === 'en'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  language === 'hi'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'POSH Law Complete Guide' : 'पॉश कानून पूर्ण गाइड'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'en' 
              ? 'Everything you need to know about the Prevention of Sexual Harassment Act, 2013'
              : 'यौन उत्पीड़न निवारण अधिनियम, 2013 के बारे में जानने के लिए आवश्यक सब कुछ'
            }
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
  