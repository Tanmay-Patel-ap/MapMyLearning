const mongoose = require('mongoose');
const PublicRoadmap = require('../models/PublicRoadmap');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

const roadmaps = [
  {
    title: 'React Developer',
    topic: 'React',
    category: 'skill',
    description: 'A step-by-step path to master React.js for modern web development.',
    steps: [
      {
        title: 'JavaScript Fundamentals',
        description: 'Master ES6+ features: arrow functions, destructuring, template literals, modules, promises, and async/await. These are essential before touching React.',
        resources: ['MDN Web Docs - JavaScript Guide', 'JavaScript.info', 'You Don\'t Know JS (book series)']
      },
      {
        title: 'React Core Concepts',
        description: 'Learn JSX syntax, components, props, and state. Understand the virtual DOM, component lifecycle, and how React renders UI efficiently.',
        resources: ['React Official Docs', 'React Tutorial for Beginners', 'Full React Course 2024 (freeCodeCamp)']
      },
      {
        title: 'Hooks & State Management',
        description: 'Master useState, useEffect, useContext, useReducer. Learn custom hooks pattern and when to reach for state management libraries like Zustand or Redux Toolkit.',
        resources: ['React Hooks API Reference', 'useHooks.com', 'Redux Toolkit Docs']
      },
      {
        title: 'Routing & Data Fetching',
        description: 'Implement client-side routing with React Router. Learn data fetching patterns with TanStack Query (React Query) and handle loading/error states.',
        resources: ['React Router Docs', 'TanStack Query Docs', 'Build a React Router app tutorial']
      },
      {
        title: 'Testing & Deployment',
        description: 'Write unit tests with Vitest/React Testing Library. Build and deploy React apps to Vercel, Netlify, or Docker. Learn optimization techniques like code splitting and lazy loading.',
        resources: ['Vitest Docs', 'React Testing Library', 'Vercel Deployment Guide']
      }
    ]
  },
  {
    title: 'Python Developer',
    topic: 'Python',
    category: 'skill',
    description: 'A complete learning path to become proficient in Python programming.',
    steps: [
      {
        title: 'Python Syntax & Basics',
        description: 'Learn variables, data types, conditionals, loops, functions, and file I/O. Get comfortable with Python\'s indentation-based syntax and REPL.',
        resources: ['Python Official Tutorial', 'Automate the Boring Stuff with Python', 'W3Schools Python Tutorial']
      },
      {
        title: 'Data Structures & OOP',
        description: 'Master lists, dicts, sets, tuples, list comprehensions, and generators. Learn classes, inheritance, dunder methods, and decorators.',
        resources: ['Real Python - Data Structures', 'Python OOP Tutorial', 'GeeksforGeeks Python OOP']
      },
      {
        title: 'Standard Library & Packages',
        description: 'Explore os, sys, json, re, collections, itertools. Learn pip, virtual environments, and how to publish your own package to PyPI.',
        resources: ['Python Standard Library Docs', 'PyPI - Python Package Index', 'pip Documentation']
      },
      {
        title: 'Automation & Scripting',
        description: 'Write scripts for file management, web scraping (BeautifulSoup, Selenium), data processing (pandas), and interacting with APIs (requests library).',
        resources: ['BeautifulSoup Docs', 'Pandas Getting Started', 'Requests Library Guide']
      },
      {
        title: 'Testing & Best Practices',
        description: 'Write tests with pytest, format code with Black, lint with ruff. Learn type hints, logging, and project structure conventions.',
        resources: ['pytest Docs', 'Black Formatter', 'Python Type Checking Guide']
      }
    ]
  },
  {
    title: 'Android Developer',
    topic: 'Android',
    category: 'role',
    description: 'Everything you need to know to become a professional Android engineer.',
    steps: [
      {
        title: 'Kotlin Fundamentals',
        description: 'Master Kotlin syntax, null safety, coroutines, and extension functions. Kotlin is the modern standard for Android development.',
        resources: ['Kotlin Official Docs', 'Kotlin Koans (interactive exercises)', 'Google\'s Kotlin for Android course']
      },
      {
        title: 'Android SDK & Architecture',
        description: 'Understand the Android platform: activities, fragments, intents, services, broadcast receivers. Learn MVVM architecture with ViewModel and LiveData/StateFlow.',
        resources: ['Android Developer Guides', 'Android Architecture Components', 'Now in Android app (Google sample)']
      },
      {
        title: 'Jetpack Compose & UI',
        description: 'Build declarative UIs with Jetpack Compose. Learn composables, state hoisting, theming, navigation, and Material Design 3 components.',
        resources: ['Jetpack Compose Docs', 'Material Design 3 for Compose', 'Compose Pathway (Google codelabs)']
      },
      {
        title: 'Networking & Data Persistence',
        description: 'Implement REST API calls with Retrofit/Ktor. Store data locally with Room database, DataStore, and understand ContentProviders.',
        resources: ['Retrofit Docs', 'Room Database Guide', 'DataStore Documentation']
      },
      {
        title: 'Publishing & App Store',
        description: 'Prepare your app for release: signing, proguard, versioning. Submit to Google Play Store, understand store listing, ratings, and in-app billing basics.',
        resources: ['Google Play Console Guide', 'Android App Bundle docs', 'Publishing checklist (Android Developers)']
      }
    ]
  },
  {
    title: 'iOS Developer',
    topic: 'iOS',
    category: 'role',
    description: 'A comprehensive roadmap to becoming an iOS engineer using modern Apple frameworks.',
    steps: [
      {
        title: 'Swift Fundamentals',
        description: 'Master Swift: optionals, closures, protocols, generics, error handling, and value semantics. Swift is the primary language for all Apple platforms.',
        resources: ['Swift Documentation', 'Swift Playgrounds (iPad/Mac)', 'Hacking with Swift (Paul Hudson)']
      },
      {
        title: 'Xcode & UIKit',
        description: 'Learn Xcode IDE, Interface Builder, Auto Layout. Build UIs programmatically and with Storyboards. Understand UIViewControllers, UITableView, UICollectionView.',
        resources: ['Apple Developer Xcode Guide', 'UIKit Documentation', 'iOS Academy YouTube']
      },
      {
        title: 'SwiftUI & Modern Architecture',
        description: 'Build declarative UIs with SwiftUI. Learn @State, @Binding, @ObservedObject, MVVM pattern, NavigationStack, and Combine framework.',
        resources: ['SwiftUI Tutorials (Apple)', '100 Days of SwiftUI', 'SwiftUI by Example']
      },
      {
        title: 'Networking & Persistence',
        description: 'Implement REST APIs with URLSession and async/await. Use CoreData or SwiftData for persistence. Learn Codable, CloudKit, and background tasks.',
        resources: ['URLSession Programming Guide', 'CoreData Stack Guide', 'SwiftData Documentation']
      },
      {
        title: 'App Store Submission',
        description: 'Prepare for App Store: certificates, provisioning profiles, TestFlight, App Store Connect. Understand app review guidelines, metadata, and in-app purchases.',
        resources: ['App Store Connect Guide', 'App Review Guidelines', 'TestFlight Overview']
      }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB');

    await PublicRoadmap.deleteMany({});
    console.log('[Seed] Cleared existing public roadmaps');

    const inserted = await PublicRoadmap.insertMany(roadmaps);
    console.log(`[Seed] Inserted ${inserted.length} public roadmaps`);

    await mongoose.connection.close();
    console.log('[Seed] Done — connection closed');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err.message);
    process.exit(1);
  }
}

seed();
