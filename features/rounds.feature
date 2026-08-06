Feature: Rounds

  Scenario: Prevent deleting a round with matches
    Given a round tournament "cup" exists
    And a round named "Round 1" exists in tournament "cup"
    And a match exists in round "Round 1"
    When I try to delete the round "Round 1"
    Then I should receive a round error saying "Cannot delete round with existing matches"

  Scenario: Delete an empty round
    Given a round tournament "cup" exists
    And a round named "Round 1" exists in tournament "cup"
    When I delete the round "Round 1"
    Then I should not see a round named "Round 1"
