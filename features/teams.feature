Feature: Teams

  Scenario: Create and list teams
    Given there are no teams
    And there is a player named "John Doe" with nickname "Johnny"
    When I create a team named "The A-Team" with player "John Doe"
    Then I should see a team named "The A-Team"

  Scenario: Update a team's name
    Given there are no teams
    And there is a player named "John Doe" with nickname "Johnny"
    When I create a team named "The A-Team" with player "John Doe"
    And I update the team's name to "The B-Team"
    Then the team name should be "The B-Team"

  Scenario: Delete a team
    Given there are no teams
    And there is a player named "John Doe" with nickname "Johnny"
    When I create a team named "The A-Team" with player "John Doe"
    And I delete the team
    Then I should not see a team named "The A-Team"

  Scenario: Prevent creating team with non-existent player
    Given there are no teams
    When I try to create a team named "Ghost Team" with player "Ghost Player"
    Then I should receive a team error saying "Player not found"

  Scenario: Prevent updating non-existent team
    Given there are no teams
    When I try to update a non-existent team "Ghost Team" to "Real Team"
    Then I should receive a team error saying "Team not found"

  Scenario: Update a team's players
    Given there are no teams
    And there is a player named "John Doe" with nickname "Johnny"
    And there is a player named "Jane Doe" with nickname "Janie"
    When I create a team named "Original Team" with player "John Doe"
    Then I should see a team named "Original Team" with player "John Doe"
    When I update the team named "Original Team" to have player "Jane Doe"
    Then I should see a team named "Original Team" with player "Jane Doe"
    And I should see a team named "Original Team" without player "John Doe"
