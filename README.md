# Silent Code Mentor

> **Silently optimize, refactor, and enhance your code as you develop.**

---

## Overview

Silent Code Mentor is a powerful VS Code extension designed for web developers. It works behind the scenes to subtly optimize and enhance your JavaScript, HTML, and CSS code without interrupting your workflow.

Whether you're a beginner or a seasoned developer, Silent Code Mentor ensures your code follows best practices, improves performance, and maintains accessibility standards—all while letting you focus on creativity.

---

## Features

- 🧑‍💻 **Real-time Code Refactoring**:
  - Automatically replaces outdated JavaScript patterns (e.g., `var` to `let`/`const`).
  - Ensures proper error handling in `async/await` functions.

- 🌐 **HTML Accessibility Enhancements**:
  - Adds missing `alt` attributes to `<img>` tags.
  - Ensures semantic HTML structure.

- 🎨 **CSS WCAG Compliance**:
  - Identifies low-contrast colors and suggests WCAG-compliant alternatives.

- 🧪 **Silent Unit Test Generation** *(Coming Soon)*:
  - Automatically generates unit tests for your JavaScript functions.

- 📊 **Weekly Coding Insights** *(Planned Feature)*:
  - Provides feedback on coding habits and areas for improvement.

---

## Installation

### Via VSIX File (for testing)

1. Download the `.vsix` file from the repository or package it using `vsce`.
2. Open VS Code.
3. Go to the **Extensions** view (`Ctrl+Shift+X`).
4. Click the three-dot menu (`...`) and select **Install from VSIX...**.
5. Select the `silent-code-mentor-<version>.vsix` file.

### From the VS Code Marketplace *(Coming Soon)*

1. Search for **Silent Code Mentor** in the Extensions view.
2. Click **Install**.

---

## Usage

1. Open any JavaScript, HTML, or CSS file in VS Code.
2. Start coding as usual. Silent Code Mentor works in the background to:
   - Refactor and improve your code upon saving the file.
   - Fix accessibility issues for web development.
   - Suggest improvements to CSS styles for better compliance.
3. View the changes silently applied to your code.

---

## Examples

### **Before Refactoring (JavaScript):**
```javascript
var name = "John";
function greet() {
  console.log("Hello, " + name + "!");
}
After Refactoring:
javascript
Copy code
let name = "John";
function greet() {
  console.log(`Hello, ${name}!`);
}
Before Enhancing (HTML):
html
Copy code
<img src="image.jpg">
After Enhancing:
html
Copy code
<img src="image.jpg" alt="Image description">
Before CSS Update:
css
Copy code
body {
  color: #888888;
}
After CSS Update:
css
Copy code
body {
  color: #333333; /* Updated for WCAG compliance */
}
Configuration
Silent Code Mentor uses default rules for code enhancements. Future versions will include:

Customizable settings for personal coding styles.
Integration with popular style guides (e.g., Airbnb, Google).
Development
If you want to contribute or explore the source code:

Clone the repository:

bash
Copy code
git clone https://github.com/samibs/silent-code-mentor.git
cd silent-code-mentor
Install dependencies:

bash
Copy code
npm install
Launch the extension in development mode:

bash
Copy code
code .
Press F5 to start debugging.

Planned Features
🌟 AI-Driven Contextual Refactoring:

Detects the purpose of your code and enhances it automatically.
🔍 Deep Accessibility Checks:

Comprehensive audits for WCAG standards across HTML and CSS.
📈 Insightful Reports:

Weekly summaries of common coding patterns and mistakes.
🛠️ Framework-Specific Enhancements:

Optimizations tailored for React, Angular, and Vue.js.
Feedback and Support
We value your feedback! If you encounter issues or have suggestions for improvement:

Open an issue on the GitHub repository.
Reach out to us at support@silentcodementor.com.
License
This project is licensed under the MIT License.

markdown
Copy code

---

### **Changes Made**

1. **Fixed Example Code Blocks:**
   - Added proper syntax highlighting with `javascript`, `html`, and `css`.

2. **Validated Image Links:**
   - Removed placeholder or missing images. You can reintroduce images by adding them to your repository (e.g., under an `images/` directory) and referencing them in the `README.md`.

3. **GitHub Repository Link:**
   - Updated the repository link to match your `https://github.com/samibs/silent-code-mentor` URL.

4. **Clean Markdown Syntax:**
   - Ensured proper headings, lists, and block formatting.

---

This updated `README.md` should pass the `vsce package` requirements. Let me know if you encounter further issues!












