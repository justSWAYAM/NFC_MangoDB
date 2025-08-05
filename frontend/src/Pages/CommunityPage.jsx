import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  BookOpen,
  Gavel,
  Calendar,
  MapPin,
  Star,
  Phone,
  Mail,
  ArrowLeft,
  Shield,
} from "lucide-react";

const CommunityPage = () => {
  console.log('CommunityPage component rendered');
  const [searchParams] = useSearchParams();
  const incidentType = searchParams.get("incidentType") || "Sexual Harassment";
  const [activeTab, setActiveTab] = useState("blogs");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedLawyer, setSelectedLawyer] = useState(null);

  // Sample blogs data based on incident type
  const getBlogsByIncidentType = (type) => {
    const blogsData = {
      "Sexual Harassment": [
        {
          id: 1,
          title:
            "Understanding Your Rights: A Guide to Sexual Harassment at Work",
          author: "Community Contributors",
          date: "2024-01-15",
          excerpt:
            "Learn about the legal protections available to you when facing sexual harassment in the workplace...",
          readTime: "5 min read",
          tags: ["Workplace Rights", "Legal Guide", "Empowerment"],
        },
        {
          id: 2,
          title: "How to Document and Report Sexual Harassment Effectively",
          author: "Community Contributors",
          date: "2024-01-12",
          excerpt:
            "Proper documentation is crucial when reporting sexual harassment. Here's a step-by-step guide...",
          readTime: "7 min read",
          tags: ["Documentation", "Reporting", "Evidence"],
        },
        {
          id: 3,
          title: "Healing After Sexual Harassment: Self-Care and Recovery",
          author: "Community Contributors",
          date: "2024-01-10",
          excerpt:
            "The emotional impact of sexual harassment can be profound. Here are strategies for healing and recovery...",
          readTime: "6 min read",
          tags: ["Mental Health", "Self-Care", "Recovery"],
        },
        {
          id: 4,
          title: "Supporting Survivors: How to Be an Ally in the Workplace",
          author: "Community Contributors",
          date: "2024-01-08",
          excerpt:
            "Learn how to support colleagues who have experienced sexual harassment and create a safer workplace...",
          readTime: "4 min read",
          tags: ["Allyship", "Support", "Workplace Culture"],
        },
        {
          id: 5,
          title:
            "Legal Timeline: What to Expect When Filing a Sexual Harassment Complaint",
          author: "Community Contributors",
          date: "2024-01-05",
          excerpt:
            "Understanding the legal process and timeline can help you prepare for what's ahead...",
          readTime: "8 min read",
          tags: ["Legal Process", "Timeline", "Complaint Filing"],
        },
      ],
      "Workplace Discrimination": [
        {
          id: 1,
          title: "Recognizing Workplace Discrimination: Signs and Red Flags",
          author: "Community Contributors",
          date: "2024-01-15",
          excerpt:
            "Discrimination can be subtle. Learn to identify the warning signs and patterns of workplace discrimination...",
          readTime: "6 min read",
          tags: ["Discrimination", "Recognition", "Workplace"],
        },
        {
          id: 2,
          title:
            "Gender Pay Gap: Understanding and Addressing Wage Discrimination",
          author: "Community Contributors",
          date: "2024-01-12",
          excerpt:
            "Explore the realities of the gender pay gap and strategies for addressing wage discrimination...",
          readTime: "7 min read",
          tags: ["Pay Gap", "Wage Discrimination", "Gender Equality"],
        },
        {
          id: 3,
          title: "Building Inclusive Workplaces: A Guide for Employers",
          author: "Community Contributors",
          date: "2024-01-10",
          excerpt:
            "How organizations can create truly inclusive environments that prevent discrimination...",
          readTime: "5 min read",
          tags: ["Inclusion", "Diversity", "Leadership"],
        },
        {
          id: 4,
          title: "Your Rights Under Anti-Discrimination Laws",
          author: "Community Contributors",
          date: "2024-01-08",
          excerpt:
            "A comprehensive overview of your legal protections against workplace discrimination...",
          readTime: "8 min read",
          tags: ["Legal Rights", "Anti-Discrimination", "Law"],
        },
        {
          id: 5,
          title:
            "From Victim to Advocate: Stories of Overcoming Discrimination",
          author: "Community Contributors",
          date: "2024-01-05",
          excerpt:
            "Inspiring stories from women who have successfully fought workplace discrimination...",
          readTime: "10 min read",
          tags: ["Stories", "Advocacy", "Empowerment"],
        },
      ],
      Violence: [
        {
          id: 1,
          title:
            "Domestic Violence in the Workplace: Recognizing and Responding",
          author: "Community Contributors",
          date: "2024-01-15",
          excerpt:
            "How to identify signs of domestic violence affecting colleagues and provide appropriate support...",
          readTime: "6 min read",
          tags: ["Domestic Violence", "Workplace Safety", "Support"],
        },
        {
          id: 2,
          title: "Creating Safe Spaces: Violence Prevention in Communities",
          author: "Community Contributors",
          date: "2024-01-12",
          excerpt:
            "Community-based approaches to preventing violence and creating safer environments for women...",
          readTime: "7 min read",
          tags: ["Violence Prevention", "Community", "Safety"],
        },
        {
          id: 3,
          title: "Legal Protections Against Violence: Know Your Rights",
          author: "Community Contributors",
          date: "2024-01-10",
          excerpt:
            "Understanding the legal framework that protects women from various forms of violence...",
          readTime: "8 min read",
          tags: ["Legal Protection", "Rights", "Violence"],
        },
        {
          id: 4,
          title: "Healing from Trauma: Resources for Violence Survivors",
          author: "Community Contributors",
          date: "2024-01-08",
          excerpt:
            "Comprehensive guide to healing resources and support systems for violence survivors...",
          readTime: "9 min read",
          tags: ["Trauma", "Healing", "Support"],
        },
        {
          id: 5,
          title: "Empowering Women: Self-Defense and Safety Strategies",
          author: "Community Contributors",
          date: "2024-01-05",
          excerpt:
            "Practical safety strategies and self-defense techniques for women in various situations...",
          readTime: "5 min read",
          tags: ["Self-Defense", "Safety", "Empowerment"],
        },
      ],
      Others: [
        {
          id: 1,
          title: "Understanding Workplace Bullying and Harassment",
          author: "Community Contributors",
          date: "2024-01-15",
          excerpt:
            "Differentiating between various forms of workplace mistreatment and how to address them...",
          readTime: "6 min read",
          tags: ["Bullying", "Harassment", "Workplace"],
        },
        {
          id: 2,
          title: "Mental Health and Workplace Wellbeing",
          author: "Community Contributors",
          date: "2024-01-12",
          excerpt:
            "How workplace issues affect mental health and strategies for maintaining wellbeing...",
          readTime: "7 min read",
          tags: ["Mental Health", "Wellbeing", "Workplace"],
        },
        {
          id: 3,
          title: "Digital Harassment: Navigating Online Safety",
          author: "Community Contributors",
          date: "2024-01-10",
          excerpt:
            "Understanding and protecting against harassment in digital spaces and social media...",
          readTime: "5 min read",
          tags: ["Digital Safety", "Online Harassment", "Technology"],
        },
        {
          id: 4,
          title: "Building Resilience: Coping with Workplace Challenges",
          author: "Community Contributors",
          date: "2024-01-08",
          excerpt:
            "Strategies for building resilience and maintaining strength in challenging workplace situations...",
          readTime: "6 min read",
          tags: ["Resilience", "Coping", "Personal Growth"],
        },
        {
          id: 5,
          title: "Community Support Networks: Finding Your Tribe",
          author: "Community Contributors",
          date: "2024-01-05",
          excerpt:
            "How to find and build supportive communities for women facing workplace challenges...",
          readTime: "4 min read",
          tags: ["Community", "Support", "Networking"],
        },
      ],
    };
    return blogsData[type] || blogsData["Sexual Harassment"];
  };

  // Sample lawyers data based on incident type
  const getLawyersByIncidentType = (type) => {
    const lawyersData = {
      "Sexual Harassment": [
        {
          id: 1,
          name: "Sarah Johnson",
          specialization: "Sexual Harassment Law",
          experience: "15+ years",
          rating: 4.9,
          location: "New York, NY",
          phone: "+1 (555) 123-4567",
          email: "sarah.johnson@lawfirm.com",
          description:
            "Specialized in workplace sexual harassment cases with a 95% success rate",
        },
        {
          id: 2,
          name: "Dr. Maria Rodriguez",
          specialization: "Employment Law & Sexual Harassment",
          experience: "12+ years",
          rating: 4.8,
          location: "Los Angeles, CA",
          phone: "+1 (555) 234-5678",
          email: "maria.rodriguez@employmentlaw.com",
          description:
            "Expert in complex sexual harassment cases and workplace discrimination",
        },
        {
          id: 3,
          name: "Jennifer Williams",
          specialization: "Women's Rights & Sexual Harassment",
          experience: "18+ years",
          rating: 4.9,
          location: "Chicago, IL",
          phone: "+1 (555) 345-6789",
          email: "jennifer.williams@womensrights.com",
          description:
            "Dedicated advocate for women's rights with extensive sexual harassment litigation experience",
        },
        {
          id: 4,
          name: "Lisa Chen",
          specialization: "Workplace Harassment & Discrimination",
          experience: "10+ years",
          rating: 4.7,
          location: "San Francisco, CA",
          phone: "+1 (555) 456-7890",
          email: "lisa.chen@workplacejustice.com",
          description:
            "Specialized in helping victims of workplace harassment and discrimination",
        },
        {
          id: 5,
          name: "Amanda Foster",
          specialization: "Sexual Harassment & Civil Rights",
          experience: "14+ years",
          rating: 4.8,
          location: "Washington, DC",
          phone: "+1 (555) 567-8901",
          email: "amanda.foster@civilrights.com",
          description:
            "Civil rights attorney with expertise in sexual harassment and workplace justice",
        },
      ],
      "Workplace Discrimination": [
        {
          id: 1,
          name: "Rachel Green",
          specialization: "Employment Discrimination Law",
          experience: "16+ years",
          rating: 4.9,
          location: "New York, NY",
          phone: "+1 (555) 678-9012",
          email: "rachel.green@discriminationlaw.com",
          description:
            "Expert in all forms of workplace discrimination including gender, race, and age discrimination",
        },
        {
          id: 2,
          name: "David Martinez",
          specialization: "Equal Employment Opportunity",
          experience: "13+ years",
          rating: 4.8,
          location: "Los Angeles, CA",
          phone: "+1 (555) 789-0123",
          email: "david.martinez@eeolaw.com",
          description:
            "Specialized in EEOC cases and workplace discrimination litigation",
        },
        {
          id: 3,
          name: "Sarah Kim",
          specialization: "Gender Discrimination & Pay Equity",
          experience: "11+ years",
          rating: 4.7,
          location: "Seattle, WA",
          phone: "+1 (555) 890-1234",
          email: "sarah.kim@payequity.com",
          description:
            "Focused on gender pay gap cases and workplace discrimination",
        },
        {
          id: 4,
          name: "Michael Thompson",
          specialization: "Employment Law & Discrimination",
          experience: "15+ years",
          rating: 4.8,
          location: "Boston, MA",
          phone: "+1 (555) 901-2345",
          email: "michael.thompson@employmentlaw.com",
          description:
            "Comprehensive employment law practice with focus on discrimination cases",
        },
        {
          id: 5,
          name: "Emily Watson",
          specialization: "Workplace Rights & Discrimination",
          experience: "12+ years",
          rating: 4.9,
          location: "Austin, TX",
          phone: "+1 (555) 012-3456",
          email: "emily.watson@workplacerights.com",
          description:
            "Dedicated to protecting workplace rights and fighting discrimination",
        },
      ],
      Violence: [
        {
          id: 1,
          name: "Dr. Emily Watson",
          specialization: "Domestic Violence & Family Law",
          experience: "17+ years",
          rating: 4.9,
          location: "New York, NY",
          phone: "+1 (555) 123-7890",
          email: "emily.watson@domesticviolence.com",
          description:
            "Specialized in domestic violence cases and protective orders",
        },
        {
          id: 2,
          name: "Maria Santos",
          specialization: "Violence Prevention & Civil Rights",
          experience: "14+ years",
          rating: 4.8,
          location: "Los Angeles, CA",
          phone: "+1 (555) 234-8901",
          email: "maria.santos@violenceprevention.com",
          description:
            "Expert in violence prevention and civil rights protection",
        },
        {
          id: 3,
          name: "Lisa Park",
          specialization: "Criminal Law & Victim Rights",
          experience: "16+ years",
          rating: 4.9,
          location: "Chicago, IL",
          phone: "+1 (555) 345-9012",
          email: "lisa.park@victimrights.com",
          description:
            "Criminal defense attorney specializing in victim rights and protection",
        },
        {
          id: 4,
          name: "Dr. Jennifer Adams",
          specialization: "Trauma-Informed Legal Practice",
          experience: "13+ years",
          rating: 4.7,
          location: "San Francisco, CA",
          phone: "+1 (555) 456-0123",
          email: "jennifer.adams@traumalaw.com",
          description:
            "Trauma-informed approach to legal representation for violence survivors",
        },
        {
          id: 5,
          name: "Captain Sarah Johnson",
          specialization: "Criminal Justice & Victim Advocacy",
          experience: "15+ years",
          rating: 4.8,
          location: "Washington, DC",
          phone: "+1 (555) 567-1234",
          email: "sarah.johnson@victimadvocacy.com",
          description:
            "Former law enforcement officer now specializing in victim advocacy",
        },
      ],
      Others: [
        {
          id: 1,
          name: "Dr. Robert Chen",
          specialization: "Employment Law & Workplace Issues",
          experience: "18+ years",
          rating: 4.8,
          location: "New York, NY",
          phone: "+1 (555) 678-2345",
          email: "robert.chen@workplaceissues.com",
          description:
            "Comprehensive employment law practice covering various workplace challenges",
        },
        {
          id: 2,
          name: "Dr. Amanda Wilson",
          specialization: "Mental Health Law & Workplace Rights",
          experience: "12+ years",
          rating: 4.7,
          location: "Los Angeles, CA",
          phone: "+1 (555) 789-3456",
          email: "amanda.wilson@mentalhealthlaw.com",
          description:
            "Specialized in mental health accommodations and workplace rights",
        },
        {
          id: 3,
          name: "Tech Safety Expert",
          specialization: "Digital Rights & Online Harassment",
          experience: "10+ years",
          rating: 4.6,
          location: "San Francisco, CA",
          phone: "+1 (555) 890-4567",
          email: "tech.safety@digitalrights.com",
          description:
            "Expert in digital harassment cases and online safety legal issues",
        },
        {
          id: 4,
          name: "Life Coach Maria",
          specialization: "Workplace Wellness & Legal Support",
          experience: "14+ years",
          rating: 4.8,
          location: "Austin, TX",
          phone: "+1 (555) 901-5678",
          email: "maria.coach@workplacewellness.com",
          description:
            "Combines legal expertise with workplace wellness and personal development",
        },
        {
          id: 5,
          name: "Community Organizer",
          specialization: "Community Law & Advocacy",
          experience: "16+ years",
          rating: 4.9,
          location: "Portland, OR",
          phone: "+1 (555) 012-6789",
          email: "community.organizer@advocacy.com",
          description:
            "Community-based legal advocacy and support for workplace issues",
        },
      ],
    };
    return lawyersData[type] || lawyersData["Sexual Harassment"];
  };

  const blogs = getBlogsByIncidentType(incidentType);
  const lawyers = getLawyersByIncidentType(incidentType);

  const handleReadMore = (blog) => {
    setSelectedBlog(blog);
  };

  const handleViewProfile = (lawyer) => {
    setSelectedLawyer(lawyer);
  };

  const closeModal = () => {
    setSelectedBlog(null);
    setSelectedLawyer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Community Support
                </h1>
                <p className="text-sm text-gray-600">
                  Resources for {incidentType}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="text-orange-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Incident Type Banner */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Shield className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Support Resources for {incidentType}
              </h2>
              <p className="text-gray-600">
                Find relevant blogs from other women and connect with
                specialized lawyers
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg shadow-sm border p-1 mb-8">
          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === "blogs"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <BookOpen size={20} />
            <span>Blogs & Stories</span>
          </button>
          <button
            onClick={() => setActiveTab("lawyers")}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === "lawyers"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Gavel size={20} />
            <span>Legal Support</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Blogs & Stories from Other Women
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <Calendar size={14} />
                    <span>{blog.date}</span>
                    <span>•</span>
                    <span>{blog.readTime}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {blog.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">{blog.excerpt}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-orange-600">
                      {blog.author}
                    </span>
                                         <button 
                       onClick={() => handleReadMore(blog)}
                       className="text-orange-500 hover:text-orange-700 text-sm font-medium"
                     >
                       Read More →
                     </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "lawyers" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Specialized Lawyers for {incidentType}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lawyers.map((lawyer) => (
                <div
                  key={lawyer.id}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <Gavel className="text-orange-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {lawyer.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {lawyer.specialization}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < Math.floor(lawyer.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {lawyer.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span>{lawyer.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>{lawyer.experience} experience</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">
                    {lawyer.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone size={14} className="text-gray-500" />
                      <span className="text-gray-700">{lawyer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail size={14} className="text-gray-500" />
                      <span className="text-gray-700">{lawyer.email}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                      Contact
                    </button>
                                         <button 
                       onClick={() => handleViewProfile(lawyer)}
                       className="flex-1 border border-orange-500 text-orange-500 py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
                     >
                       View Profile
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
                 )}
       </div>

       {/* Blog Modal */}
       {selectedBlog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center">
           <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
           <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
             <div className="p-6">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xl font-bold text-gray-900">{selectedBlog.title}</h3>
                 <button 
                   onClick={closeModal}
                   className="text-gray-400 hover:text-gray-600 text-2xl"
                 >
                   ×
                 </button>
               </div>
               <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                 <Calendar size={14} />
                 <span>{selectedBlog.date}</span>
                 <span>•</span>
                 <span>{selectedBlog.readTime}</span>
                 <span>•</span>
                 <span className="text-orange-600 font-medium">{selectedBlog.author}</span>
               </div>
               <div className="flex flex-wrap gap-2 mb-4">
                 {selectedBlog.tags.map((tag, index) => (
                   <span 
                     key={index}
                     className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
                   >
                     {tag}
                   </span>
                 ))}
               </div>
               <div className="prose max-w-none">
                 <p className="text-gray-700 leading-relaxed mb-4">
                   {selectedBlog.excerpt}
                 </p>
                 <p className="text-gray-700 leading-relaxed mb-4">
                   This is a detailed article about {selectedBlog.title.toLowerCase()}. 
                   The content provides comprehensive information and guidance for women 
                   facing similar situations. The article includes practical advice, 
                   legal information, and personal stories from other women who have 
                   experienced similar challenges.
                 </p>
                 <p className="text-gray-700 leading-relaxed mb-4">
                   Remember that you are not alone, and there are resources and support 
                   available to help you through difficult situations. Always prioritize 
                   your safety and well-being, and don't hesitate to reach out for help 
                   when needed.
                 </p>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Lawyer Profile Modal */}
       {selectedLawyer && (
         <div className="fixed inset-0 z-50 flex items-center justify-center">
           <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
           <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
             <div className="p-6">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xl font-bold text-gray-900">Lawyer Profile</h3>
                 <button 
                   onClick={closeModal}
                   className="text-gray-400 hover:text-gray-600 text-2xl"
                 >
                   ×
                 </button>
               </div>
               <div className="flex items-start space-x-4 mb-6">
                 <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                   <Gavel className="text-orange-600" size={32} />
                 </div>
                 <div className="flex-1">
                   <h4 className="text-2xl font-bold text-gray-900 mb-1">{selectedLawyer.name}</h4>
                   <p className="text-lg text-gray-600 mb-2">{selectedLawyer.specialization}</p>
                   <div className="flex items-center space-x-2 mb-2">
                     <div className="flex items-center">
                       {[...Array(5)].map((_, i) => (
                         <Star 
                           key={i} 
                           size={16} 
                           className={i < Math.floor(selectedLawyer.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}
                         />
                       ))}
                     </div>
                     <span className="text-sm text-gray-600">{selectedLawyer.rating} rating</span>
                   </div>
                   <div className="flex items-center space-x-4 text-sm text-gray-600">
                     <div className="flex items-center space-x-1">
                       <MapPin size={14} />
                       <span>{selectedLawyer.location}</span>
                     </div>
                     <div className="flex items-center space-x-1">
                       <Calendar size={14} />
                       <span>{selectedLawyer.experience} experience</span>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="space-y-4">
                 <div>
                   <h5 className="font-semibold text-gray-900 mb-2">About</h5>
                   <p className="text-gray-700">{selectedLawyer.description}</p>
                 </div>
                 <div>
                   <h5 className="font-semibold text-gray-900 mb-2">Contact Information</h5>
                   <div className="space-y-2">
                     <div className="flex items-center space-x-2">
                       <Phone size={16} className="text-gray-500" />
                       <span className="text-gray-700">{selectedLawyer.phone}</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <Mail size={16} className="text-gray-500" />
                       <span className="text-gray-700">{selectedLawyer.email}</span>
                     </div>
                   </div>
                 </div>
                 <div>
                   <h5 className="font-semibold text-gray-900 mb-2">Areas of Expertise</h5>
                   <div className="flex flex-wrap gap-2">
                     {selectedLawyer.specialization.split('&').map((area, index) => (
                       <span 
                         key={index}
                         className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
                       >
                         {area.trim()}
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default CommunityPage;
