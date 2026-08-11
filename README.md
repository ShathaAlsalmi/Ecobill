# EcoBill — Smart Home Utility Optimization Platform

> EcoBill is a smart, unified platform designed to manage and optimize residential electricity and water consumption in Saudi Arabia. It combines Computer Vision, an interactive 3D Digital Twin, and AI Agents for financial ROI and sustainability planning.

---

## Problem & Solution

* **The Problem:** The residential sector faces rising electricity and water waste, complex progressive utility tariffs, and a lack of interactive tools that provide custom financial analytics and home simulations for residents.
* **The Solution (EcoBill):** An interactive web application powered by AI to automatically process bills via Vision OCR, benchmark home consumption against official Saudi open data (GASTAT 2024), simulate saving scenarios through a 3D Digital Twin, and deliver actionable saving plans with accurate ROI payback calculations.

---

## Key Features

1. **Instant AI OCR Bill Reader:**
   - Automatically extracts and classifies data from Saudi Electricity Company (SEC) and National Water Company (NWC) bills using Gemini Vision API.

2. **Saudi Regional Benchmarking:**
   - Maps household consumption directly against official open data (GASTAT 2024) across all 13 Saudi regions, generating a custom efficiency index (Eco-Score).

3. **Interactive 3D Digital Twin (What-If Simulator):**
   - A real-time 3D simulation environment built with Three.js / React Three Fiber to test the impact of HVAC settings, solar PV panels, water flow restrictors, and hidden pipe leaks.

4. **AI Agents Hub:**
   - **Financial ROI Agent:** Deconstructs tariff tiers, calculates payback periods in months for energy-efficient upgrades, and computes combined annual savings.
   - **Smart Advisor Agent:** Interactive monthly efficiency action plans with completion tracking and automatic integration of recommendations from the live AI Chat.

5. **Bilingual & Adaptive Design:**
   - Full support for English and Arabic 🇸🇦 with instant Light/Dark mode toggling.

---

## Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS, Lucide Icons
* **3D & Graphics:** Three.js, React Three Fiber
* **Backend & Cloud:** Firebase, Node.js
* **AI & Vision:** Gemini Vision API, Gemini Pro API
* **Data Sources:** GASTAT (General Authority for Statistics) Open Data 2024, SEC & NWC Residential Tariffs

---

## Future Roadmap

- Direct integration with SEC and NWC IoT Smart Meter APIs for live real-time data sync.
- Launching mobile applications (iOS & Android) featuring proactive push notifications before exceeding Tier 1 tariff limits.
- Expanding predictive load models based on live regional weather and seasonal data.

---

## Team

* **EcoBill Team** — Developed for the **AI Champions Challenge 2026** - Tuwaiq Academy.
