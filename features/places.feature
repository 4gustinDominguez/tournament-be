Feature: Places

  Scenario: Create a place
    Given a place tournament "cup" exists
    When I create a place named "Stadium A" in tournament "cup"
    Then I should see a place named "Stadium A"

  Scenario: Delete a place
    Given a place tournament "cup" exists
    And a place named "Stadium A" exists in tournament "cup"
    When I delete the place "Stadium A"
    Then I should not see a place named "Stadium A"

  Scenario: Prevent deleting a non-existent place
    Given there are no places
    When I try to delete a non-existent place
    Then I should receive a place error saying "Place not found"
