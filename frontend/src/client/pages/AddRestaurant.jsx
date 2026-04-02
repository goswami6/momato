import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store, User, Phone, Mail, MapPin, Clock, UtensilsCrossed,
  Camera, ChevronRight, ChevronLeft, Check, Plus, X, Info,
  Truck, Coffee, Wine, ArrowRight
} from 'lucide-react';

const cuisineOptions = [
  'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican',
  'Japanese', 'Thai', 'Continental', 'Street Food', 'Mughlai',
  'Bengali', 'Desserts', 'Beverages', 'Fast Food', 'Biryani',
  'Pizza', 'Bakery', 'Seafood', 'Kebab', 'Healthy Food'
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AddRestaurant = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    // Step 1 — Basic Info
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    // Step 2 — Location & Type
    address: '',
    city: '',
    locality: '',
    pincode: '',
    latitude: '',
    longitude: '',
    restaurantType: [],
    // Step 3 — Menu & Cuisine
    cuisines: [],
    costForTwo: '',
    vegOnly: false,
    hasBar: false,
    // Step 4 — Hours & Photos
    openTime: '10:00',
    closeTime: '23:00',
    closedDays: [],
    description: '',
    photos: [],
  });

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleArrayItem = (field, item) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Validation per step
  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.restaurantName.trim()) errs.restaurantName = 'Restaurant name is required';
      if (!form.ownerName.trim()) errs.ownerName = 'Owner name is required';
      if (!form.email.trim()) errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
      if (!form.phone.trim()) errs.phone = 'Phone number is required';
      else if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number';
    }
    if (s === 2) {
      if (!form.address.trim()) errs.address = 'Address is required';
      if (!form.city.trim()) errs.city = 'City is required';
      if (!form.locality.trim()) errs.locality = 'Locality is required';
      if (!form.pincode.trim()) errs.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode';
      if (form.restaurantType.length === 0) errs.restaurantType = 'Select at least one type';
    }
    if (s === 3) {
      if (form.cuisines.length === 0) errs.cuisines = 'Select at least one cuisine';
      if (!form.costForTwo.trim()) errs.costForTwo = 'Average cost is required';
      else if (isNaN(form.costForTwo) || Number(form.costForTwo) < 50) errs.costForTwo = 'Enter a valid amount (min ₹50)';
    }
    return errs;
  };

  const nextStep = () => {
    const errs = validateStep(step);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhotoAdd = () => {
    // Simulated photo upload
    const fakePhotos = [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400',
    ];
    if (form.photos.length < 5) {
      const next = fakePhotos[form.photos.length];
      updateForm('photos', [...form.photos, next]);
    }
  };

  const removePhoto = (idx) => {
    updateForm('photos', form.photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1800);
  };

  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Location' },
    { num: 3, label: 'Menu' },
    { num: 4, label: 'Finish' },
  ];

  const restaurantTypes = [
    { id: 'dine-in', label: 'Dine-in', icon: UtensilsCrossed, desc: 'Sit-down dining experience' },
    { id: 'delivery', label: 'Delivery', icon: Truck, desc: 'Home delivery service' },
    { id: 'cafe', label: 'Café', icon: Coffee, desc: 'Coffee and snacks' },
    { id: 'bar', label: 'Bar / Lounge', icon: Wine, desc: 'Drinks and nightlife' },
  ];

  // --- SUCCESS STATE ---
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4 pt-8 pb-8 md:pt-[100px] md:pb-10">
        <div className="w-full max-w-[520px] text-center">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-8 sm:p-12">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-green-500" />
            </div>
            <h1 className="text-[26px] font-bold text-[#1C1C1C] mb-3">Application Submitted!</h1>
            <p className="text-[15px] text-[#696969] mb-2 leading-relaxed">
              Thank you for registering <span className="font-semibold text-[#1C1C1C]">{form.restaurantName}</span> on momato.
            </p>
            <p className="text-[14px] text-[#9C9C9C] mb-8 leading-relaxed">
              Our team will review your application and get back to you at <span className="font-medium text-[#696969]">{form.email}</span> within 2–3 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl bg-[#EF4F5F] text-white font-semibold text-[15px] hover:bg-[#d9434f] transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={() => { setSubmitted(false); setStep(1); setForm({ restaurantName: '', ownerName: '', email: '', phone: '', address: '', city: '', locality: '', pincode: '', latitude: '', longitude: '', restaurantType: [], cuisines: [], costForTwo: '', vegOnly: false, hasBar: false, openTime: '10:00', closeTime: '23:00', closedDays: [], description: '', photos: [] }); }}
                className="px-6 py-3 rounded-xl border border-gray-200 text-[#1C1C1C] font-semibold text-[15px] hover:bg-gray-50 transition-colors"
              >
                Register Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-0 md:pt-[72px]">
      {/* Hero Banner */}
      <div className="relative bg-[#1C1C1C] overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C1C1C]/60 to-[#1C1C1C]" />
        <div className="relative max-w-[1100px] mx-auto px-4 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-[40px] font-bold text-white mb-3 leading-tight">
            Partner with momato
          </h1>
          <p className="text-[16px] md:text-[18px] text-white/70 max-w-[520px] mx-auto leading-relaxed">
            Reach millions of customers. Grow your restaurant business with online ordering and table reservations.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-[680px] mx-auto px-4 py-8 md:py-12">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-10 px-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > s.num ? 'bg-green-500 text-white' :
                  step === s.num ? 'bg-[#EF4F5F] text-white shadow-lg shadow-[#EF4F5F]/25' :
                    'bg-gray-200 text-[#9C9C9C]'
                  }`}>
                  {step > s.num ? <Check size={18} /> : s.num}
                </div>
                <span className={`text-[12px] font-medium hidden sm:block ${step >= s.num ? 'text-[#1C1C1C]' : 'text-[#9C9C9C]'
                  }`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-[2px] mx-2 mt-[-20px] sm:mt-[-24px] rounded-full transition-colors ${step > s.num ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sm:p-10">

          {/* ---- STEP 1: Basic Info ---- */}
          {step === 1 && (
            <div>
              <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-1">Basic Information</h2>
              <p className="text-[14px] text-[#9C9C9C] mb-8">Tell us about your restaurant and how to reach you</p>

              <div className="space-y-5">
                {/* Restaurant Name */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Restaurant Name</label>
                  <div className="relative">
                    <Store size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                    <input
                      type="text"
                      placeholder="e.g. The Curry House"
                      value={form.restaurantName}
                      onChange={(e) => updateForm('restaurantName', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${errors.restaurantName ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'
                        }`}
                    />
                  </div>
                  {errors.restaurantName && <p className="text-[#EF4F5F] text-[13px] mt-1">{errors.restaurantName}</p>}
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Owner / Manager Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.ownerName}
                      onChange={(e) => updateForm('ownerName', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${errors.ownerName ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'
                        }`}
                    />
                  </div>
                  {errors.ownerName && <p className="text-[#EF4F5F] text-[13px] mt-1">{errors.ownerName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Business Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                    <input
                      type="email"
                      placeholder="restaurant@example.com"
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${errors.email ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'
                        }`}
                    />
                  </div>
                  {errors.email && <p className="text-[#EF4F5F] text-[13px] mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                    <div className="absolute left-11 top-1/2 -translate-y-1/2 text-[15px] text-[#696969] font-medium">+91</div>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) => updateForm('phone', e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-[4.5rem] pr-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${errors.phone ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'
                        }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[#EF4F5F] text-[13px] mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ---- STEP 2: Location & Type ---- */}
          {step === 2 && (
            <div>
              <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-1">Location & Type</h2>
              <p className="text-[14px] text-[#9C9C9C] mb-8">Where is your restaurant and what kind of establishment is it?</p>

              <div className="space-y-5">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Full Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-3.5 text-[#9C9C9C]" />
                    <textarea
                      rows={2}
                      placeholder="Shop no., building, street name..."
                      value={form.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors resize-none ${errors.address ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'
                        }`}
                    />
                  </div>
                  {errors.address && <p className="text-[#EF4F5F] text-[13px] mt-1">{errors.address}</p>}
                </div>

                {/* City + Locality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Varanasi"
                      value={form.city}
                      onChange={(e) => updateForm('city', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${errors.city ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'
                        }`}
                    />
                    {errors.city && <p className="text-[#EF4F5F] text-[13px] mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Locality / Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Lanka, Sigra"
                      value={form.locality}
                      onChange={(e) => updateForm('locality', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${errors.locality ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'
                        }`}
                    />
                    {errors.locality && <p className="text-[#EF4F5F] text-[13px] mt-1">{errors.locality}</p>}
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Pincode</label>
                  <input
                    type="text"
                    placeholder="221005"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => updateForm('pincode', e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors max-w-[200px] ${errors.pincode ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'
                      }`}
                  />
                  {errors.pincode && <p className="text-[#EF4F5F] text-[13px] mt-1">{errors.pincode}</p>}
                </div>

                {/* GPS Location */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">
                    Restaurant Location on Map <span className="text-[#9C9C9C] font-normal">(optional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!navigator.geolocation) return;
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            updateForm('latitude', pos.coords.latitude);
                            updateForm('longitude', pos.coords.longitude);
                          },
                          () => { }
                        );
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EF4F5F] text-[#EF4F5F] text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      <MapPin size={16} /> Use my current location
                    </button>
                    {form.latitude && form.longitude && (
                      <span className="text-sm text-[#267E3E] font-medium">
                        ✓ {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Restaurant Type */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-3">Restaurant Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {restaurantTypes.map(type => {
                      const selected = form.restaurantType.includes(type.id);
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => toggleArrayItem('restaurantType', type.id)}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${selected
                            ? 'border-[#EF4F5F] bg-[#EF4F5F]/5'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                        >
                          <type.icon size={20} className={selected ? 'text-[#EF4F5F] mt-0.5' : 'text-[#9C9C9C] mt-0.5'} />
                          <div>
                            <div className={`text-[14px] font-semibold ${selected ? 'text-[#EF4F5F]' : 'text-[#1C1C1C]'}`}>{type.label}</div>
                            <div className="text-[12px] text-[#9C9C9C]">{type.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.restaurantType && <p className="text-[#EF4F5F] text-[13px] mt-2">{errors.restaurantType}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ---- STEP 3: Menu & Cuisine ---- */}
          {step === 3 && (
            <div>
              <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-1">Cuisine & Pricing</h2>
              <p className="text-[14px] text-[#9C9C9C] mb-8">What kind of food do you serve and at what price range?</p>

              <div className="space-y-6">
                {/* Cuisine Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-3">
                    Cuisines Served
                    <span className="text-[#9C9C9C] font-normal ml-1">(select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {cuisineOptions.map(c => {
                      const selected = form.cuisines.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleArrayItem('cuisines', c)}
                          className={`px-3.5 py-2 rounded-full text-[13px] font-medium border transition-all ${selected
                            ? 'bg-[#EF4F5F] text-white border-[#EF4F5F]'
                            : 'bg-white text-[#696969] border-gray-200 hover:border-[#EF4F5F] hover:text-[#EF4F5F]'
                            }`}
                        >
                          {selected && <span className="mr-1">✓</span>}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  {errors.cuisines && <p className="text-[#EF4F5F] text-[13px] mt-2">{errors.cuisines}</p>}
                </div>

                {/* Cost for Two */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Average Cost for Two</label>
                  <div className="relative max-w-[240px]">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-[#696969] font-medium">₹</span>
                    <input
                      type="text"
                      placeholder="500"
                      value={form.costForTwo}
                      onChange={(e) => updateForm('costForTwo', e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none transition-colors ${errors.costForTwo ? 'border-[#EF4F5F] bg-red-50/50' : 'border-gray-200 focus:border-[#EF4F5F] bg-white'
                        }`}
                    />
                  </div>
                  {errors.costForTwo && <p className="text-[#EF4F5F] text-[13px] mt-1">{errors.costForTwo}</p>}
                </div>

                {/* Toggles */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-gray-200 bg-white flex-1">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={form.vegOnly}
                        onChange={() => updateForm('vegOnly', !form.vegOnly)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${form.vegOnly ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${form.vegOnly ? 'left-5' : 'left-1'}`} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-[#1C1C1C]">Pure Veg</div>
                      <div className="text-[12px] text-[#9C9C9C]">Only vegetarian food</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-gray-200 bg-white flex-1">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={form.hasBar}
                        onChange={() => updateForm('hasBar', !form.hasBar)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${form.hasBar ? 'bg-[#EF4F5F]' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${form.hasBar ? 'left-5' : 'left-1'}`} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-[#1C1C1C]">Serves Alcohol</div>
                      <div className="text-[12px] text-[#9C9C9C]">Licensed bar / lounge</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ---- STEP 4: Hours, Photos, Description ---- */}
          {step === 4 && (
            <div>
              <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-1">Final Details</h2>
              <p className="text-[14px] text-[#9C9C9C] mb-8">Operating hours, photos, and anything else you'd like to share</p>

              <div className="space-y-6">
                {/* Operating Hours */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-3">
                    <Clock size={16} className="inline mr-1.5 -mt-0.5" />
                    Operating Hours
                  </label>
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <div className="text-[12px] text-[#9C9C9C] mb-1">Opens at</div>
                      <input
                        type="time"
                        value={form.openTime}
                        onChange={(e) => updateForm('openTime', e.target.value)}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C1C1C] outline-none focus:border-[#EF4F5F]"
                      />
                    </div>
                    <span className="text-[#9C9C9C] mt-5">to</span>
                    <div>
                      <div className="text-[12px] text-[#9C9C9C] mb-1">Closes at</div>
                      <input
                        type="time"
                        value={form.closeTime}
                        onChange={(e) => updateForm('closeTime', e.target.value)}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C1C1C] outline-none focus:border-[#EF4F5F]"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-[13px] text-[#696969] mb-2">Closed on:</div>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map(day => {
                        const closed = form.closedDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleArrayItem('closedDays', day)}
                            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all ${closed
                              ? 'bg-[#EF4F5F] text-white border-[#EF4F5F]'
                              : 'bg-white text-[#696969] border-gray-200 hover:border-[#EF4F5F]'
                              }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[12px] text-[#9C9C9C] mt-1">Leave empty if open all days</p>
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-3">
                    <Camera size={16} className="inline mr-1.5 -mt-0.5" />
                    Restaurant Photos
                    <span className="text-[#9C9C9C] font-normal ml-1">(up to 5)</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {form.photos.map((photo, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {form.photos.length < 5 && (
                      <button
                        type="button"
                        onClick={handlePhotoAdd}
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-[#9C9C9C] hover:border-[#EF4F5F] hover:text-[#EF4F5F] transition-colors"
                      >
                        <Plus size={20} />
                        <span className="text-[11px]">Add</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Description (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Tell diners what makes your restaurant special..."
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-[#1C1C1C] placeholder:text-[#BCBCBC] outline-none focus:border-[#EF4F5F] resize-none"
                  />
                </div>

                {/* Summary Preview */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={16} className="text-[#EF4F5F]" />
                    <h3 className="text-[14px] font-semibold text-[#1C1C1C]">Submission Summary</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
                    <div><span className="text-[#9C9C9C]">Restaurant:</span> <span className="text-[#1C1C1C] font-medium">{form.restaurantName || '—'}</span></div>
                    <div><span className="text-[#9C9C9C]">Owner:</span> <span className="text-[#1C1C1C] font-medium">{form.ownerName || '—'}</span></div>
                    <div><span className="text-[#9C9C9C]">Location:</span> <span className="text-[#1C1C1C] font-medium">{form.locality && form.city ? `${form.locality}, ${form.city}` : '—'}</span></div>
                    <div><span className="text-[#9C9C9C]">Type:</span> <span className="text-[#1C1C1C] font-medium">{form.restaurantType.length > 0 ? form.restaurantType.join(', ') : '—'}</span></div>
                    <div><span className="text-[#9C9C9C]">Cuisines:</span> <span className="text-[#1C1C1C] font-medium">{form.cuisines.length > 0 ? form.cuisines.slice(0, 3).join(', ') + (form.cuisines.length > 3 ? ` +${form.cuisines.length - 3}` : '') : '—'}</span></div>
                    <div><span className="text-[#9C9C9C]">Cost for two:</span> <span className="text-[#1C1C1C] font-medium">{form.costForTwo ? `₹${form.costForTwo}` : '—'}</span></div>
                    <div><span className="text-[#9C9C9C]">Hours:</span> <span className="text-[#1C1C1C] font-medium">{form.openTime} – {form.closeTime}</span></div>
                    <div><span className="text-[#9C9C9C]">Photos:</span> <span className="text-[#1C1C1C] font-medium">{form.photos.length} uploaded</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={`flex mt-8 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-[#1C1C1C] font-semibold text-[14px] hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EF4F5F] text-white font-semibold text-[15px] hover:bg-[#d9434f] transition-colors shadow-lg shadow-[#EF4F5F]/20"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#EF4F5F] text-white font-semibold text-[15px] hover:bg-[#d9434f] transition-colors shadow-lg shadow-[#EF4F5F]/20 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-8 mb-4">
          <p className="text-[13px] text-[#9C9C9C]">
            By submitting, you agree to momato's <span className="text-[#EF4F5F] cursor-pointer hover:underline">Terms of Service</span> for restaurant partners.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;
