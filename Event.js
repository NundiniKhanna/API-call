// Define the Event class or object
class Event {
  constructor(uid, name, tagline, schedule, description, files, moderator, category, sub_category, rigor_rank, attendees) {
    this.type = 'event';
    this.uid = uid;
    this.name = name;
    this.tagline = tagline;
    this.schedule = schedule;
    this.description = description;
    this.files = files;
    this.moderator = moderator;
    this.category = category;
    this.sub_category = sub_category;
    this.rigor_rank = rigor_rank;
    this.attendees = attendees;
  }
}

// Usage example:
const event = new Event(
  18,
  'Event Name',
  'Event Tagline',
  new Date(), // replace with actual timestamp
  'Event Description',
  { image: 'path/to/image.jpg' }, // replace with actual image file
  'Moderator User',
  'Event Category',
  'Event Sub Category',
  5,
  ['user1', 'user2', 'user3'] // replace with actual user IDs
);

console.log(event);
