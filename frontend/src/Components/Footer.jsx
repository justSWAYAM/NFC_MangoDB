import React from "react";
import { Heart, Phone } from "lucide-react"; // Import Mail icon for better visual

const Footer = () => {
  return (
    <footer className="bg-white shadow-inner py-6 dark:bg-gray-800 font-inter">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          {/* EiraSafe branding / left section */}
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm dark:text-gray-400">
              Devi - Your safe space for healing and support
            </p>
          </div>

          {/* Main content area of the footer - now allowing flexible spacing */}
          <div className="flex flex-col md:flex-row items-center justify-center flex-grow gap-x-44 mt-4 md:mt-0">
            {/* Suggestions and Made With - Moved to the left of contact info on desktop */}
            <div className="flex flex-col items-center text-sm text-gray-500 dark:text-gray-400 order-2 md:order-1 mb-4 md:mb-0">
              <p className="mb-1 text-center">
                Have a suggestion? Please mail us at{" "}
                <a
                  href="mailto:eirasafe@gmail.com"
                  className="text-purple-700 hover:text-purple-900 font-medium dark:text-purple-300 dark:hover:text-purple-100"
                >
                  devi@gmail.com
                </a>
              </p>
              <div className="flex items-center">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 mx-1" />
                <span>for safety and healing</span>
              </div>
            </div>

            {/* Contact Information Group - Now in the middle */}
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 order-1 md:order-2 mb-4 md:mb-0 -mr-24">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-purple-600 mr-2 dark:text-purple-400" />
                <a
                  href="tel:112"
                  className="text-purple-700 hover:text-purple-900 text-sm font-medium dark:text-purple-300 dark:hover:text-purple-100"
                >
                  Female Helpline: 112
                </a>
              </div>

              {/* <div className="flex items-center"> */}
              {/* <Mail className="h-4 w-4 text-purple-600 mr-2 dark:text-purple-400" /> */}
              {/* <a  */}
              {/* href="mailto:eirasafe@gmail.com"  */}
              {/* className="text-purple-700 hover:text-purple-900 text-sm font-medium dark:text-purple-300 dark:hover:text-purple-100" */}
              {/* > */}
              {/* eirasafe@gmail.com */}
              {/* </a> */}
              {/* </div> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
