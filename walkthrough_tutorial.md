# CodeMatch Walkthrough Tutorial

Welcome to CodeMatch! This guide provides a comprehensive walkthrough for both **Admins** and **Consumers (Students)** to help you navigate and utilize the CodeMatch platform features.

---

## 💻 Consumer (Student) Walkthrough

CodeMatch is designed to help you find teammates, build coding projects, solve algorithmic problems, and collaborate in real-time.

### 1. Set Up Your Profile & Projects
- **Profile Info**: Navigate to **Profile** (via sidebar) to update your name, bio, college, department, and academic year. This data is used by the match engine to suggest compatible teammates.
- **My Projects**: Switch to the **My Projects** tab on your profile page to:
  - Add your coding projects with description, GitHub repository link, and live demo URL.
  - Specify the tech stack (e.g. `react`, `nodejs`, `postgresql`) used in the project.
  - Highlight your best work by checking **Feature this project on my profile**.

### 2. Form Collaboration Teams
- **Create a Team**: Navigate to **Teams** in the sidebar. Click **Create Team**, enter a name and description. A unique 6-character **Join Code** will be generated.
- **Join a Team**: If a friend shares a code, paste it in the **Join a Team** box on the Teams page.
- **Roles & Permissions**:
  - The creator of the team is the **Leader**.
  - Leaders can promote other members to **Admin** status or demote them.
  - Leaders and Admins can invite new members directly by email or remove members.

### 3. Connect with Recommended Matches
- Navigate to **Matches** to view compatible students sorted by a **Compatibility Score** calculated from shared skills, interests, and academic background.
- Apply filters to narrow down by skill name, college, or department.
- Click **Invite** to request connection or collaboration.

### 4. Interactive Real-Time Chat
- Open **Messages** in the sidebar to chat with teammates.
- **Emoji Board**: Click 😊 to quickly insert emojis in your message.
- **File Sharing**: Click the attachment clip 📎 icon to send images or documents.
- **Real-Time Indicators**: Keep track with typing indicators, online status dots, and double-tick read receipts.
- **Search**: Enter text in the header search input to instantly filter messages in the open chat.

### 5. Algorithmic Coding Arena
- Navigate to **Problems** in the sidebar.
- Choose a problem to solve (Easy, Medium, Hard).
- **Console Panel**: Write your solution in Monaco Editor.
  - Check **Enable Custom Stdin** in the Testcase tab to test your code on custom inputs.
  - Click **Run Code** to execute sample cases or custom inputs.
  - Click **Submit** to evaluate against hidden test cases. Successful submissions trigger celebratory solved notifications!
- **Dashboards Stats**: Track your solves count, success rate, and active activity heatmap on the main Dashboard.

---

## 🛡️ Admin Operations Walkthrough

As an Admin, you are responsible for content creation, platform status supervision, and user statistics.

### 1. Challenge & Problem Management
- Navigate to the **Problems** page.
- Click the **⚙ Admin Panel** button in the hero section.
- **Create a Problem**:
  - Enter the title, category, description, and difficulty.
  - Set the **Status** (Draft or Published) and **Visibility** (Public or Private). Draft/Private problems are invisible to student profiles.
  - Supply the **Starter Code** templates for Javascript and Python.
  - Define example cases and all public/hidden **Test Cases** as JSON arrays.
- **Edit & Delete**: Select any existing problem in the challenges list to populate the editor form, make updates, or delete it from the database.

### 2. Platform Growth Supervision
- The main **Dashboard** displays a dedicated **🛡 Admin Platform Analytics** card.
- View real-time platform usage metrics:
  - **Total Users**: Count of registered developers.
  - **Active Users**: Users who submitted code solutions.
  - **Total Teams Created**: Active developer collaborative groups.
  - **Total Coding Problems**: Active platform challenges.
