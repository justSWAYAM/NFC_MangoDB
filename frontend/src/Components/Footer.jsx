import React from "react";
import { Heart, Phone, Mail, Shield, Users, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200/50 dark:border-gray-700/50">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-7">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                DEVI
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm max-w-sm mx-auto md:mx-0">
              Your trusted companion for safety, support, and healing. We're
              here to help you navigate through difficult times.
            </p>
            <div className="flex items-center justify-center md:justify-start text-sm text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-2 w-fit mx-auto md:mx-0">
              <Users className="h-4 w-4 mr-2" />
              <span>Supporting survivors since 2025</span>
            </div>
          </div>

          {/* Emergency Resources */}
          <div className="text-center">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
              Emergency Resources
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="tel:112"
                className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        National Emergency
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Available 24/7
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform">
                    112
                  </span>
                </div>
              </a>

              <a
                href="tel:1091"
                className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        Women's Helpline
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Specialized support
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                    1091
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
              Get Support
            </h4>
            <div className="space-y-3">
              <a
                href="mailto:devi@gmail.com"
                className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50 block"
              >
                <div className="flex items-center justify-center md:justify-end gap-3">
                  <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-medium text-purple-600 dark:text-purple-400 text-sm group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                      devi@gmail.com
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      We're here to help
                    </p>
                  </div>
                </div>
              </a>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center justify-center md:justify-end gap-2 mb-1">
                  <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    24/7 Support
                  </span>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Always here when you need us
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Made with love section */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 mx-2 animate-pulse" />
              <span>for safety and healing</span>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-600 dark:text-gray-400 order-1 sm:order-2">
              <span>© 2025 EiraSafe. All rights reserved.</span>
            </div>

            {/* Privacy & Terms */}
            <div className="flex items-center gap-4 text-sm order-3">
              <a
                href="/privacy"
                className="text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              >
                Privacy
              </a>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a
                href="/terms"
                className="text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
