// src/config/goodDeeds.js

export const GOOD_DEEDS = {
    meditation: {
      name: "Meditation",
      icon: "🧘",
      color: "#8A2BE2", // BlueViolet
      options: {
        primary: {
          type: "duration",
          values: [
            { value: "5min", label: "5 minutes" },
            { value: "10min", label: "10 minutes" },
            { value: "15min", label: "15 minutes" },
            { value: "20min", label: "20 minutes" },
            { value: "30min", label: "30 minutes" },
            { value: "45min", label: "45 minutes" },
            { value: "60min", label: "1 hour" },
          ],
          label: "Duration"
        },
        secondary: {
          type: "type",
          values: [
            { value: "mindfulness", label: "Mindfulness" },
            { value: "breathing", label: "Breathing" },
            { value: "guided", label: "Guided" },
            { value: "walking", label: "Walking" },
            { value: "mantra", label: "Mantra" }
          ],
          label: "Type"
        }
      },
      generateContent: (duration, type, notes) => {
        const content = `Practiced ${type.toLowerCase()} meditation for ${duration}.`;
        return notes ? `${content} ${notes}` : content;
      }
    },
    
    journaling: {
      name: "Journaling",
      icon: "📓",
      color: "#20B2AA", // LightSeaGreen
      options: {
        primary: {
          type: "duration",
          values: [
            { value: "5min", label: "5 minutes" },
            { value: "10min", label: "10 minutes" },
            { value: "15min", label: "15 minutes" },
            { value: "20min", label: "20 minutes" },
            { value: "30min", label: "30 minutes" },
            { value: "45min", label: "45 minutes" },
          ],
          label: "Time Spent"
        },
        secondary: {
          type: "focus",
          values: [
            { value: "gratitude", label: "Gratitude" },
            { value: "goals", label: "Goals" },
            { value: "reflection", label: "Reflection" },
            { value: "creativity", label: "Creative Writing" },
            { value: "planning", label: "Planning" }
          ],
          label: "Focus"
        }
      },
      generateContent: (duration, focus, notes) => {
        const content = `Journaled about ${focus.toLowerCase()} for ${duration}.`;
        return notes ? `${content} ${notes}` : content;
      }
    },
    
    yoga: {
      name: "Yoga/Exercise",
      icon: "🏋️",
      color: "#FF6347", // Tomato
      options: {
        primary: {
          type: "duration",
          values: [
            { value: "15min", label: "15 minutes" },
            { value: "20min", label: "20 minutes" },
            { value: "30min", label: "30 minutes" },
            { value: "45min", label: "45 minutes" },
            { value: "60min", label: "1 hour" },
            { value: "90min", label: "1.5 hours" },
          ],
          label: "Duration"
        },
        secondary: {
          type: "exerciseType",
          values: [
            { value: "yoga", label: "Yoga" },
            { value: "running", label: "Running" },
            { value: "walking", label: "Walking" },
            { value: "cycling", label: "Cycling" },
            { value: "weights", label: "Weight Training" },
            { value: "hiit", label: "HIIT" },
            { value: "swimming", label: "Swimming" },
            { value: "other", label: "Other" }
          ],
          label: "Exercise Type"
        }
      },
      generateContent: (duration, type, notes) => {
        // Different phrasing based on the exercise type
        let content;
        switch(type.toLowerCase()) {
          case "yoga":
            content = `Practiced yoga for ${duration}.`;
            break;
          case "running":
            content = `Went running for ${duration}.`;
            break;
          case "walking":
            content = `Took a ${duration} walk.`;
            break;
          case "cycling":
            content = `Cycled for ${duration}.`;
            break;
          case "weight training":
            content = `Did weight training for ${duration}.`;
            break;
          case "hiit":
            content = `Completed a ${duration} HIIT workout.`;
            break;
          case "swimming":
            content = `Swam for ${duration}.`;
            break;
          default:
            content = `Exercised (${type.toLowerCase()}) for ${duration}.`;
        }
        return notes ? `${content} ${notes}` : content;
      }
    },
    
    volunteering: {
      name: "Volunteering",
      icon: "🤝",
      color: "#4682B4", // SteelBlue
      options: {
        primary: {
          type: "category",
          values: [
            { value: "community", label: "Community Service" },
            { value: "animals", label: "Animal Care" },
            { value: "food", label: "Food Bank" },
            { value: "environment", label: "Environmental" },
            { value: "education", label: "Education" },
            { value: "health", label: "Healthcare" },
            { value: "other", label: "Other" },
          ],
          label: "Category"
        },
        secondary: {
          type: "duration",
          values: [
            { value: "30min", label: "30 minutes" },
            { value: "1hour", label: "1 hour" },
            { value: "2hours", label: "2 hours" },
            { value: "halfday", label: "Half day" },
            { value: "fullday", label: "Full day" },
          ],
          label: "Time Spent"
        }
      },
      generateContent: (category, duration, notes) => {
        const content = `Volunteered with ${category.toLowerCase()} for ${duration.replace('hour', ' hour').replace('hours', ' hours').replace('halfday', 'half a day').replace('fullday', 'a full day')}.`;
        return notes ? `${content} ${notes}` : content;
      }
    },
    
    donation: {
      name: "Donation",
      icon: "💝",
      color: "#FF69B4", // HotPink
      options: {
        primary: {
          type: "category",
          values: [
            { value: "charity", label: "Charity" },
            { value: "food", label: "Food" },
            { value: "clothing", label: "Clothing" },
            { value: "books", label: "Books" },
            { value: "blood", label: "Blood" },
            { value: "money", label: "Money" },
            { value: "other", label: "Other" },
          ],
          label: "Type"
        },
        secondary: {
          type: "recipient",
          values: [
            { value: "disaster", label: "Disaster Relief" },
            { value: "homeless", label: "Homeless Shelter" },
            { value: "school", label: "School/Education" },
            { value: "foodbank", label: "Food Bank" },
            { value: "medical", label: "Medical Research" },
            { value: "animal", label: "Animal Shelter" },
            { value: "community", label: "Community Center" },
            { value: "other", label: "Other" }
          ],
          label: "Recipient"
        }
      },
      generateContent: (type, recipient, notes) => {
        let content;
        if (type.toLowerCase() === "blood") {
          content = `Donated blood to support ${recipient.toLowerCase()}.`;
        } else {
          content = `Donated ${type.toLowerCase()} to ${recipient.toLowerCase()}.`;
        }
        return notes ? `${content} ${notes}` : content;
      }
    }
  };
  
  // Helper function to get a good deed by name
  export function getGoodDeedByName(name) {
    const deed = Object.values(GOOD_DEEDS).find(
      deed => deed.name.toLowerCase() === name.toLowerCase()
    );
    return deed || null;
  }
  
  // Convert to array for mapping
  export const GOOD_DEEDS_ARRAY = Object.values(GOOD_DEEDS);