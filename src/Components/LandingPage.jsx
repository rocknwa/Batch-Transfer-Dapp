
import React, { useState, useEffect } from 'react';
import { ArrowRight, Send, Shield, Zap, CheckCircle } from 'lucide-react';
import Footer from './Footer';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-['Source_Sans_Pro']">
      <Navbar showFaucet={false} />
      {/* Hero Section */}
      <div className="relative min-h-[80vh] flex items-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="container mx-auto px-4 pt-12 relative">
          <div className="flex flex-col items-center text-center space-y-10">
            {/* Animated badge */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-full backdrop-blur-sm">
                <span className="animate-pulse mr-2 h-2 w-2 bg-yellow-400 rounded-full"></span>
                <span className="text-sm">Now supporting multiple chains</span>
              </div>
            </div>
            <div className="space-y-6 animate-fade-in-up delay-200">
              <h1 className="text-7xl font-bold leading-tight">
                Token Distribution
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500 animate-gradient">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                The most efficient way to send tokens to multiple addresses.
                Save time and gas with our optimized smart contracts.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in-up delay-300">
              <button 
                onClick={() => navigate('/app')} 
                className="group bg-yellow-400 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 transform hover:translate-y-1"
              >
                <span className="text-black">Get Started</span>
                <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            {/* Animated trust indicators */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up delay-400">
              <TrustIndicator icon={<CheckCircle className="w-4 h-4" />} text="Audited by CertiK" />
              <TrustIndicator icon={<CheckCircle className="w-4 h-4" />} text="100% Success Rate" />
              <TrustIndicator icon={<CheckCircle className="w-4 h-4" />} text="5000+ Users" />
              <TrustIndicator icon={<CheckCircle className="w-4 h-4" />} text="Multi-chain Support" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-12 relative">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Why Choose MultiSender"
            subtitle="Powerful features to streamline your token distribution process"
          />
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <FeatureCard
              icon={<Send className="w-8 h-8" />}
              title="Batch Transfers"
              description="Send tokens to hundreds of addresses in one transaction. Save up to 90% on gas fees."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Enterprise-Grade Security"
              description="Fully audited smart contracts with built-in safety checks and validations."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Optimized for speed and efficiency. Process hundreds of transfers in seconds."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 relative bg-gray-900/30">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Three Simple Steps"
            subtitle="Get started in minutes with our intuitive interface"
          />
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <StepCard
              number="1"
              title="Connect"
              description="Connect your Web3 wallet securely to access the platform."
            />
            <StepCard
              number="2"
              title="Configure"
              description="Upload your recipient list or input addresses manually."
            />
            <StepCard
              number="3"
              title="Send"
              description="Review and confirm your transaction with one click."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-12 text-center relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent opacity-50" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join thousands of projects using MultiSender for efficient token distribution
              </p>
              <button 
                onClick={() => navigate('/app')} 
                className="bg-yellow-400 text-black px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300"
              >
                Launch App
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

const TrustIndicator = ({ icon, text }) => (
  <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
    <span className="text-yellow-400">{icon}</span>
    {text}
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="text-center space-y-4 animate-fade-in-up">
    <h2 className="text-4xl font-bold">{title}</h2>
    <p className="text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="group bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 animate-fade-in-up">
    <div className="mb-6 p-3 bg-yellow-400/10 rounded-xl w-fit group-hover:scale-110 transition-transform">
      {React.cloneElement(icon, { className: "text-yellow-400" })}
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }) => (
  <div className="group bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 animate-fade-in-up">
    <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center font-bold text-lg mb-6 text-black group-hover:scale-110 transition-transform">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
