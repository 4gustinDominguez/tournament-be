Feature: Matches

  Scenario: Add a result to a match
    Given a tournament "cup" exists
    And a team "team-a" exists
    And a team "team-b" exists
    And a match exists between "team-a" and "team-b" in tournament "cup"
    When I add the result 2-1 to the match
    Then the match should have the result 2-1

  Scenario: Prevent negative scores
    Given a tournament "cup" exists
    And a team "team-a" exists
    And a team "team-b" exists
    And a match exists between "team-a" and "team-b" in tournament "cup"
    When I try to add the result -1 to 5 to the match
    Then I should receive a match error saying "Scores cannot be negative"

  Scenario: Add result to non-existent match
    Given there are no matches
    When I try to add result 1-0 to a non-existent match
    Then I should receive a match error saying "Match not found"

  Scenario: Update a match
    Given a tournament "cup" exists
    And a team "team-a" exists
    And a team "team-b" exists
    And a match exists between "team-a" and "team-b" in tournament "cup"
    When I update the match between "team-a" and "team-b" to be on "2023-12-25"
    Then I should see the match between "team-a" and "team-b" on "2023-12-25"

  Scenario: Delete a match
    Given a tournament "cup" exists
    And a team "team-a" exists
    And a team "team-b" exists
    And a match exists between "team-a" and "team-b" in tournament "cup"
    When I delete the match between "team-a" and "team-b"
    Then I should not see a match between "team-a" and "team-b" in tournament "cup"

  Scenario: Prevent deleting a completed match
    Given a tournament "cup" exists
    And a team "team-a" exists
    And a team "team-b" exists
    And a match exists between "team-a" and "team-b" in tournament "cup"
    When the match is completed
    And I try to delete the match between "team-a" and "team-b"
    Then I should receive a match error saying "Cannot delete a match that is live or has already been played"
