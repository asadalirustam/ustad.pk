import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, PhoneCall, Mail, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Ustaad<span className="text-brand-500">.pk</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Pakistan's premier AI-powered local service marketplace. Connecting
              households and businesses with trusted electricians, plumbers, AC
              mechanics, painters, tutors, and technicians in minutes.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% CNIC & Skill Verified Service Providers</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Popular Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/providers?category=Electrician" className="hover:text-brand-400 transition-colors">
                  Electrician & Wiring
                </Link>
              </li>
              <li>
                <Link to="/providers?category=Plumber" className="hover:text-brand-400 transition-colors">
                  Plumbing & Leakage
                </Link>
              </li>
              <li>
                <Link to="/providers?category=AC+Mechanic" className="hover:text-brand-400 transition-colors">
                  Inverter AC Jet Service
                </Link>
              </li>
              <li>
                <Link to="/providers?category=Home+Tutor" className="hover:text-brand-400 transition-colors">
                  Home & STEM Tutors
                </Link>
              </li>
              <li>
                <Link to="/providers?category=Painter" className="hover:text-brand-400 transition-colors">
                  House Painters & Polish
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Cities Active */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Cities Covered
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/providers?city=Lahore" className="hover:text-brand-400 transition-colors">
                  Lahore (Gulberg, DHA, Bahria)
                </Link>
              </li>
              <li>
                <Link to="/providers?city=Karachi" className="hover:text-brand-400 transition-colors">
                  Karachi (Clifton, Gulshan, DHA)
                </Link>
              </li>
              <li>
                <Link to="/providers?city=Islamabad" className="hover:text-brand-400 transition-colors">
                  Islamabad (F-Sector, G-Sector)
                </Link>
              </li>
              <li>
                <Link to="/providers?city=Rawalpindi" className="hover:text-brand-400 transition-colors">
                  Rawalpindi & Cantt
                </Link>
              </li>
              <li>
                <Link to="/providers?city=Faisalabad" className="hover:text-brand-400 transition-colors">
                  Faisalabad & Multan
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Support & Contact
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+92 300 1234567 (24/7 Helpline)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@ustaad.pk</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Arfa Software Technology Park, Lahore</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-300">Ustaad.pk</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Pakistan's local workforce</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
