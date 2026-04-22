-- Seed data: badges + sample programs (safe to re-run)

insert into public.badges (slug, name, description, icon, xp_reward) values
  ('first-lesson', 'First Steps', 'Complete your very first lesson', '🎯', 50),
  ('streak-7', 'Week Warrior', '7-day study streak', '🔥', 100),
  ('streak-30', 'Unstoppable', '30-day study streak', '⚡', 500),
  ('course-complete', 'Course Conqueror', 'Complete any course', '🏆', 250),
  ('early-bird', 'Early Bird', 'Study before 7am', '🌅', 75),
  ('night-owl', 'Night Owl', 'Study after 10pm', '🌙', 75),
  ('quiz-ace', 'Quiz Ace', 'Score 100% on a quiz', '🎓', 150),
  ('mentor-meeting', 'In the Room', 'Complete your first mentor session', '🤝', 200)
on conflict (slug) do nothing;

insert into public.programs (slug, name, description, is_high_ticket, requires_application) values
  ('self-serve', 'Self-Serve Course Library', 'Buy courses à la carte — yours forever.', false, false),
  ('vanguard-mentorship', 'Vanguard Mentorship', 'Invite-only 1:1 mentorship with weekly sessions, goal tracking, and accountability.', true, true)
on conflict (slug) do nothing;
