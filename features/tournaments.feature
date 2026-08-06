Feature: Tournaments

  Scenario: Create and list tournaments
    Given there are no tournaments
    When I create a tournament named "My First Tournament"
    Then I should see a tournament named "My First Tournament"

  Scenario: Get a tournament by ID
    Given there are no tournaments
    When I create a tournament named "My Awesome Tournament"
    And I get the tournament by its ID
    Then the tournament name should be "My Awesome Tournament"

  Scenario: Prevent creating tournament with end date before start date
    Given there are no tournaments
    When I try to create a tournament named "Bad Dates" with start date "2023-01-10" and end date "2023-01-01"
    Then I should receive a tournament error saying "End date must be after start date"

  Scenario: Update a tournament
    Given there are no tournaments
    When I create a tournament named "Original tournament"
    And I update the tournament named "Original tournament" to "Updated tournament"
    Then I should see a tournament named "Updated tournament"
    And I should not see a tournament named "Original tournament"

  Scenario: Delete a tournament
    Given there are no tournaments
    When I create a tournament named "Tournament to delete"
    And I delete the tournament named "Tournament to delete"
    Then I should not see a tournament named "Tournament to delete"
