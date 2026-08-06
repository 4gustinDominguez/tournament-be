Feature: Players

  Scenario: Create and list players
    Given there are no players
    When I create a player named "John Doe" with nickname "Johnny"
    Then I should see a player named "John Doe"

  Scenario: Prevent creating player with empty name
    Given there are no players
    When I try to create a player with empty name
    Then I should receive an error saying "Player name cannot be empty"

  Scenario: Prevent creating player with existing name
    Given there are no players
    And there is a player named "John Doe" with nickname "Johnny"
    When I try to create a player named "John Doe" with nickname "Jojo"
    Then I should receive an error saying "Player already exists"

  Scenario: Update a player
    Given there are no players
    And there is a player named "John Doe" with nickname "Johnny"
    When I update the player named "John Doe" to have name "John Updated" and nickname "Johnny Updated"
    Then I should see a player named "John Updated"
    And I should not see a player named "John Doe"

  Scenario: Delete a player
    Given there are no players
    And there is a player named "John Doe" with nickname "Johnny"
    When I delete the player named "John Doe"
    Then I should not see a player named "John Doe"

  Scenario: Try to update non-existent player
    Given there are no players
    When I try to update a non-existent player "Ghost"
    Then I should receive an error saying "Player not found"
