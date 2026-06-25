const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const resourceSub = new mongoose.Schema({ type: String, title: String, url: String }, { _id: false });
const stepSub = new mongoose.Schema({
  stepId: String, title: String, description: String, order: Number, resources: [resourceSub]
}, { _id: false });

const schema = new mongoose.Schema({
  title: String, topic: String, category: { type: String, enum: ['role', 'skill'] },
  description: String, steps: [stepSub], featured: Boolean, createdAt: { type: Date, default: Date.now }
});
const PublicRoadmap = mongoose.model('PublicRoadmap', schema);

const roadmaps = [
  {
    title: 'React Developer', topic: 'React', category: 'skill',
    description: 'A step-by-step path to master React.js for modern web development.',
    steps: [
      { stepId: 'step_a1b2c3', title: 'JavaScript Fundamentals', order: 1, description: 'Master ES6+ features: arrow functions, destructuring, template literals, modules, promises, and async/await.', resources: [{ type: 'Article', title: 'MDN Web Docs - JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' }, { type: 'Article', title: 'JavaScript.info', url: 'https://javascript.info' }] },
      { stepId: 'step_d4e5f6', title: 'React Core Concepts', order: 2, description: 'Learn JSX syntax, components, props, and state. Understand the virtual DOM and component lifecycle.', resources: [{ type: 'Article', title: 'React Official Docs', url: 'https://react.dev' }, { type: 'Video', title: 'Full React Course (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=DLX62G4s1Jc' }] },
      { stepId: 'step_g7h8i9', title: 'Hooks & State Management', order: 3, description: 'Master useState, useEffect, useContext, useReducer. Learn custom hooks.', resources: [{ type: 'Article', title: 'React Hooks API Reference', url: 'https://react.dev/reference/react' }, { type: 'Article', title: 'useHooks.com', url: 'https://usehooks.com' }] },
      { stepId: 'step_j0k1l2', title: 'Routing & Data Fetching', order: 4, description: 'Implement client-side routing with React Router. Learn data fetching patterns.', resources: [{ type: 'Article', title: 'React Router Docs', url: 'https://reactrouter.com' }, { type: 'Article', title: 'TanStack Query Docs', url: 'https://tanstack.com/query/latest' }] },
      { stepId: 'step_m3n4o5', title: 'Testing & Deployment', order: 5, description: 'Write unit tests with Vitest/React Testing Library. Build and deploy to Vercel.', resources: [{ type: 'Article', title: 'Vitest Docs', url: 'https://vitest.dev' }, { type: 'Article', title: 'Vercel Deployment Guide', url: 'https://vercel.com/docs' }] }
    ]
  },
  {
    title: 'Python Developer', topic: 'Python', category: 'skill',
    description: 'A complete learning path to become proficient in Python programming.',
    steps: [
      { stepId: 'step_p6q7r8', title: 'Python Syntax & Basics', order: 1, description: 'Learn variables, data types, conditionals, loops, functions, and file I/O.', resources: [{ type: 'Article', title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' }, { type: 'Video', title: 'Automate the Boring Stuff with Python', url: 'https://www.youtube.com/watch?v=1F_OgqRuSdI' }] },
      { stepId: 'step_s9t0u1', title: 'Data Structures & OOP', order: 2, description: 'Master lists, dicts, sets, tuples, comprehensions, generators, classes, and inheritance.', resources: [{ type: 'Article', title: 'Real Python - Data Structures', url: 'https://realpython.com/python-data-structures/' }, { type: 'Article', title: 'GeeksforGeeks Python OOP', url: 'https://www.geeksforgeeks.org/python-oops-concepts/' }] },
      { stepId: 'step_v2w3x4', title: 'Standard Library & Packages', order: 3, description: 'Explore os, sys, json, re, collections. Learn pip and virtual environments.', resources: [{ type: 'Article', title: 'Python Standard Library Docs', url: 'https://docs.python.org/3/library/' }, { type: 'Article', title: 'pip Documentation', url: 'https://pip.pypa.io/en/stable/' }] },
      { stepId: 'step_y5z6a7', title: 'Automation & Scripting', order: 4, description: 'Write scripts for file management, web scraping, data processing, and API interaction.', resources: [{ type: 'Article', title: 'BeautifulSoup Docs', url: 'https://www.crummy.com/software/BeautifulSoup/bs4/doc/' }, { type: 'Article', title: 'Pandas Getting Started', url: 'https://pandas.pydata.org/docs/getting_started/' }] },
      { stepId: 'step_b8c9d0', title: 'Testing & Best Practices', order: 5, description: 'Write tests with pytest, format with Black, lint with ruff. Learn type hints.', resources: [{ type: 'Article', title: 'pytest Docs', url: 'https://docs.pytest.org/' }, { type: 'Article', title: 'Black Formatter', url: 'https://black.readthedocs.io/' }] }
    ]
  },
  {
    title: 'Android Developer', topic: 'Android', category: 'role',
    description: 'Everything you need to become a professional Android engineer.',
    steps: [
      { stepId: 'step_e1f2g3', title: 'Kotlin Fundamentals', order: 1, description: 'Master Kotlin syntax, null safety, coroutines, and extension functions.', resources: [{ type: 'Article', title: 'Kotlin Official Docs', url: 'https://kotlinlang.org/docs/home.html' }, { type: 'Video', title: 'Google Kotlin for Android', url: 'https://developer.android.com/courses/kotlin-android-fundamentals/overview' }] },
      { stepId: 'step_h4i5j6', title: 'Android SDK & Architecture', order: 2, description: 'Understand activities, fragments, intents, services. Learn MVVM architecture.', resources: [{ type: 'Article', title: 'Android Developer Guides', url: 'https://developer.android.com/guide' }, { type: 'Article', title: 'Android Architecture Components', url: 'https://developer.android.com/topic/libraries/architecture' }] },
      { stepId: 'step_k7l8m9', title: 'Jetpack Compose & UI', order: 3, description: 'Build declarative UIs with Jetpack Compose. Learn composables, theming, Material Design 3.', resources: [{ type: 'Article', title: 'Jetpack Compose Docs', url: 'https://developer.android.com/jetpack/compose' }, { type: 'Video', title: 'Compose Pathway (Google)', url: 'https://developer.android.com/courses/pathways/compose' }] },
      { stepId: 'step_n0o1p2', title: 'Networking & Data Persistence', order: 4, description: 'Implement REST API calls with Retrofit/Ktor. Store data locally with Room.', resources: [{ type: 'Article', title: 'Retrofit Docs', url: 'https://square.github.io/retrofit/' }, { type: 'Article', title: 'Room Database Guide', url: 'https://developer.android.com/training/data-storage/room' }] },
      { stepId: 'step_q3r4s5', title: 'Publishing & App Store', order: 5, description: 'Prepare your app for release — signing, proguard, versioning. Submit to Google Play.', resources: [{ type: 'Article', title: 'Google Play Console Guide', url: 'https://developer.android.com/distribute' }, { type: 'Article', title: 'Android App Bundle docs', url: 'https://developer.android.com/guide/app-bundle' }] }
    ]
  },
  {
    title: 'iOS Developer', topic: 'iOS', category: 'role',
    description: 'A comprehensive roadmap to becoming an iOS engineer using modern Apple frameworks.',
    steps: [
      { stepId: 'step_t6u7v8', title: 'Swift Fundamentals', order: 1, description: 'Master Swift: optionals, closures, protocols, generics, error handling.', resources: [{ type: 'Article', title: 'Swift Documentation', url: 'https://docs.swift.org/swift-book/' }, { type: 'Video', title: 'Hacking with Swift', url: 'https://www.hackingwithswift.com' }] },
      { stepId: 'step_w9x0y1', title: 'Xcode & UIKit', order: 2, description: 'Learn Xcode IDE, Interface Builder, Auto Layout. Build UIs with Storyboards.', resources: [{ type: 'Article', title: 'Apple Developer Xcode Guide', url: 'https://developer.apple.com/xcode/' }, { type: 'Article', title: 'UIKit Documentation', url: 'https://developer.apple.com/documentation/uikit' }] },
      { stepId: 'step_z2a3b4', title: 'SwiftUI & Modern Architecture', order: 3, description: 'Build declarative UIs with SwiftUI. Learn MVVM, NavigationStack, and Combine.', resources: [{ type: 'Article', title: 'SwiftUI Tutorials (Apple)', url: 'https://developer.apple.com/tutorials/swiftui' }, { type: 'Video', title: '100 Days of SwiftUI', url: 'https://www.hackingwithswift.com/100/swiftui' }] },
      { stepId: 'step_c5d6e7', title: 'Networking & Persistence', order: 4, description: 'Implement REST APIs with URLSession and async/await. Use CoreData or SwiftData.', resources: [{ type: 'Article', title: 'URLSession Programming Guide', url: 'https://developer.apple.com/documentation/foundation/urlsession' }, { type: 'Article', title: 'SwiftData Documentation', url: 'https://developer.apple.com/documentation/swiftdata' }] },
      { stepId: 'step_f8g9h0', title: 'App Store Submission', order: 5, description: 'Prepare for App Store: certificates, TestFlight, App Store Connect.', resources: [{ type: 'Article', title: 'App Store Connect Guide', url: 'https://developer.apple.com/app-store-connect/' }, { type: 'Article', title: 'App Review Guidelines', url: 'https://developer.apple.com/app-store/review/guidelines/' }] }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected');
    await PublicRoadmap.deleteMany({});
    await PublicRoadmap.insertMany(roadmaps);
    console.log('[Seed] Inserted', roadmaps.length, 'roadmaps');
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) { console.error('[Seed Error]', e.message); process.exit(1); }
}
seed();
