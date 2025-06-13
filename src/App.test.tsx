import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App, { scoring_rules, domain_weights, assessment_responses } from './App';

test('renders the heading', () => {
  render(<App />);
  const heading = screen.getByText(/Subjective Health & Wellness Index/i);
  expect(heading).toBeInTheDocument();
});

test('scoring_rules, domain_weights, and assessment_responses are defined', () => {
  expect(scoring_rules).toBeDefined();
  expect(domain_weights).toBeDefined();
  expect(assessment_responses).toBeDefined();
});
