import React from "react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { MapPin, Phone, Mail, Send } from "lucide-react";

const ContactUs = () => {
  const formRef = useRef(null);
  const location = useLocation();
  const [form, setForm] = useState({ name: "", mobile: "", pincode: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Form submitted! We will contact you shortly.");
      setForm({ name: "", mobile: "", pincode: "" });
      setIsSubmitting(false);
    }, 800);
  };

  useEffect(() => {
    if (location.pathname === "/form" && formRef.current) {
      window.scrollTo({ top: formRef.current.offsetTop, behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="erp-root p-4 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-(--border-soft) pb-4">
        <h1 className="app-title">Contact Us</h1>
        <p className="app-subtitle mt-1">
          Get in touch with csaap ERP Ltd. Our support team is ready to assist
          you with live demos, purchases, and subscriptions.
        </p>
      </div>

      <div ref={formRef} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6 items-start">
        <div className="app-panel divide-y divide-(--border-soft)">
          <div className="p-6">
            <h2 className="app-heading mb-4">Support Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-(--bg-subtle) border border-(--border-soft) flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-(--brand)" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Let's Talk
                  </h3>
                  <p className="text-sm font-semibold text-(--text-strong) mt-1">
                    +91 74286-00607
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fax: +91 74286-00607
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-(--bg-subtle) border border-(--border-soft) flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-(--brand)" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email Support
                  </h3>
                  <p className="text-sm font-semibold text-(--text-strong) mt-1">
                    info@auditfiling.com
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    audifiling@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="app-heading mb-4">Office Locations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Head Office
                </h3>
                <p className="text-sm font-semibold text-(--text-strong)">
                  Gurugram Office
                </p>
                <p className="text-xs/relaxed text-slate-500 mt-1 ">
                  H No-511, Sarahah Tower, Subhash Nagar, Gurugram, India,
                  122006
                </p>
                <a
                  href="https://www.google.com/maps?q=H+No-511,+Sarahah+Tower,+Subhash+Nagar,+Gurugram,+122006,+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-(--brand) hover:text-(--brand-strong) font-semibold mt-3"
                >
                  <MapPin className="w-3.5 h-3.5" /> View on Google Maps
                </a>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Branch Office
                </h3>
                <p className="text-sm font-semibold text-(--text-strong)">
                  Bhubaneswar Office
                </p>
                <p className="text-xs/relaxed text-slate-500 mt-1 ">
                  3rd Floor, BMC Panchadeep Market Complex, Unit 4, Bhouma
                  Nagar, Bhubaneswar, Odisha, 751001
                </p>
                <a
                  href="https://maps.app.goo.gl/GDArGKbynTLdLFUw6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-(--brand) hover:text-(--brand-strong) font-semibold mt-3"
                >
                  <MapPin className="w-3.5 h-3.5" /> View on Google Maps
                </a>
              </div>
            </div>
          </div>

          <div className="p-1">
            <div className="h-64 md:h-80 w-full overflow-hidden rounded-b-[15px]">
              <iframe
                title="Office Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.281204176034!2d77.04275631508068!3d28.64727998241021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d19b3e8f2c3b9%3A0x6aef8e65d4b7b6e6!2sSubhash%20Nagar%2C%20Gurugram%2C%20Haryana!5e0!3m2!1sen!2sin!4v1695723456789"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 rounded-b-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Follow csaap ERP
            </span>
            <div className="flex space-x-3">
              {[
                {
                  Icon: FaFacebookF,
                  link: "https://www.facebook.com/profile.php?id=61584280923640",
                },
                {
                  Icon: FaInstagram,
                  link: "https://www.instagram.com/csaap.official/?igsh=MWxvZ2c3OGxoemFteA%3D%3D#",
                },
                {
                  Icon: FaLinkedinIn,
                  link: "https://www.linkedin.com/company/107153286/admin/dashboard/",
                },
                {
                  Icon: FaYoutube,
                  link: "https://www.youtube.com/@Csaapindia",
                },
              ].map(({ Icon, link }, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-white border border-(--border-soft) text-(--text-soft) hover:text-white hover:bg-(--brand) flex items-center justify-center transition-all duration-200 shadow-sm"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="app-panel p-6">
            <h2 className="app-heading mb-4 text-emerald-950">
              Book Free Demo
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="app-label block mb-1.5">
                  Name / Firm Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  className="app-input w-full"
                />
              </div>

              <div>
                <label className="app-label block mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-(--border-soft) bg-slate-50 text-slate-500 text-xs font-semibold">
                    +91
                  </span>
                  <input
                    name="mobile"
                    type="text"
                    required
                    placeholder="10-digit number"
                    value={form.mobile}
                    onChange={handleChange}
                    className="app-input w-full rounded-l-none"
                    pattern="[0-9]{10}"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="app-label block mb-1.5">
                  Pin Code <span className="text-red-500">*</span>
                </label>
                <input
                  name="pincode"
                  type="text"
                  required
                  placeholder="Enter area pin code"
                  value={form.pincode}
                  onChange={handleChange}
                  className="app-input w-full"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="app-btn-primary w-full mt-2 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Booking..." : "BOOK NOW"}
              </button>
            </form>
          </div>

          <div className="app-panel-muted p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Services Guide
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-(--text-strong)">
                  Demo Booking
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Schedule live walkthroughs with our modules expert anytime. We
                  will walk you through all modules and features in detail.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-(--text-strong)">
                  Purchase & Renewal
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Get pricing details, subscription renewals, billing
                  adjustments, and support selecting standard ERP plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
