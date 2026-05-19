# AtCoder Journey

AtCoder Journey is a lightweight, zero-dependency web application that provides a structured, CSES-like experience for AtCoder problems. It features a curated roadmap of classic AtCoder problems and automatically syncs the latest contests directly from the [Kenkoooo API](https://kenkoooo.com/atcoder).

## ✨ Features

- **🗺️ CSES-Style Roadmap**: A beautifully organized, curated track of algorithm problems (e.g., Educational DP Contest, Beginner Selections) categorized by topic.
- **⚡ Auto-Syncing Contests**: Never miss a new problem. The "Recent Contests" view automatically fetches and organizes the newest problems directly from AtCoder.
- **📊 User Progress Tracking**: Enter your AtCoder handle to instantly sync your submissions. Solved problems are highlighted with green checkmarks alongside an animated progress bar.
- **🎨 Premium UI**: Built with a state-of-the-art dark mode, glassmorphism, and smooth micro-animations.
- **🚀 Zero Dependencies**: Completely built in Vanilla HTML, CSS, and JavaScript. No build steps, no Node.js required—just open and run!

## 🚀 How to Use

Because there are no build steps, running the project is incredibly simple:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/atcoder-journey.git
   ```
2. Navigate to the project directory:
   ```bash
   cd atcoder-journey
   ```
3. Double-click `index.html` to open it in your web browser.

## 🛠️ Customizing the Roadmap

You can easily add your own problem tracks, topics, or specific problems! 
Simply open `curriculum.js` and add new objects to the `CURRICULUM` array:

```javascript
{
    id: "your_topic_id",
    title: "Your Custom Topic Name",
    problems: [
        "abc170_a", // The AtCoder problem ID
        "abc170_b"
    ]
}
```

The app will automatically fetch the problem titles and difficulty colors from the Kenkoooo API.

## 🤝 Contributing

Contributions are welcome! If you'd like to add more curated tracks (e.g., Advanced Graph Algorithms, Math tracks) to `curriculum.js` or improve the UI, feel free to open a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Data provided by the incredible [AtCoder Problems API (Kenkoooo)](https://kenkoooo.com/atcoder).
- Icons provided by [Lucide](https://lucide.dev/).
