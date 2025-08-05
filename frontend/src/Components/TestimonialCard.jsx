import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TestimonialCard = ({ testimonial, index }) => {
  const { name, role, content, rating } = testimonial;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
    >
      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        ))}
      </div>

      <p className="text-gray-600 leading-relaxed mb-6 italic">"{content}"</p>

      <div>
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
