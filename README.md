# Quick Power: Survival Sample Size Estimation

This web application provides tools for estimating sample size in survival analysis, primarily utilizing Schoenfeld's formula from his 1983 paper "Sample-Size Formula for the Proportional-Hazards Regression Model". It helps researchers and statisticians determine the necessary number of events and total sample size for clinical trials comparing two survival distributions.

## Features

*   **Schoenfeld's Formula Implementation:** Calculate the required number of events and total sample size based on user-defined parameters such as significance level (alpha), power (beta), group proportions, and hazard ratio.
*   **Proportional-Hazards Model:** The calculations are grounded in the proportional-hazards regression model, assuming a constant hazard ratio between two treatment groups.
*   **Interactive Parameter Input:** Easily adjust key parameters to see their impact on sample size estimations.
*   **Survival Curve Visualization:**
    *   **Survival Plot:** Visualize the survival probabilities for both treatment and control groups based on the input hazard ratio and survival points.
    *   **Events Plot:** Illustrates the estimated event accrual over time for each group, providing a naive point estimate of events.
    *   **Exponential Survival Plot:** Fits and displays exponential survival curves to the provided and derived survival data, offering a parametric view of the survival distributions.
*   **Mean Survival Sampling Distribution Simulation:**
    *   Estimates the sampling distribution of mean survival through simulation, providing a more robust (though computationally intensive) alternative to Schoenfeld's formula.
    *   Allows adjustment of simulation parameters (permutations, simulations, evaluations) to balance accuracy and computation time.

## How it Works

The application guides users through the process of:
1.  **Estimating Event Count:** Determining the total number of events required for the trial using Schoenfeld's equation (1).
2.  **Estimating Total Sample Size:** Calculating the total sample size by dividing the required event count by the proportion of expected events in the trial, considering the proportion of patients randomized to each treatment arm.
3.  **Visualizing Parameters:** Providing graphical representations of survival curves, event accrual, and fitted exponential models to better understand the underlying assumptions and implications of the input parameters.
4.  **Simulating Survival Distributions:** Offering a simulation-based approach to estimate the mean survival sampling distribution, which can provide a more flexible analysis by making fewer assumptions about the generating distributions.

## Technologies Used

*   **React:** Frontend JavaScript library for building user interfaces.
*   **Vite:** Fast build tool for modern web projects.
*   **TypeScript:** Typed superset of JavaScript that compiles to plain JavaScript.
*   **KaTeX:** Fast math typesetting for the web, used for rendering mathematical equations.
*   **Recharts:** A composable charting library built with React components.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.

## Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/quick-power.git
    cd quick-power
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

4.  **Build for production:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory with the production-ready build.

## Project Structure

```
.
├── public/             # Static assets
├── src/
│   ├── components/     # React components for UI elements
│   ├── utils/          # Utility functions for calculations and validations
│   ├── types/          # TypeScript type definitions
│   ├── workers/        # Web workers for computationally intensive tasks (e.g., simulations)
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Entry point for the React application
│   └── ...
├── index.html          # Main HTML file
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build configuration
└── ...
```