# Scratchy
Scratchy is a pure client side protocol for encrypting, storing and retrieving data on the BSV blockchain at scale.

#Overview
The key purpose of the protocol is that it allows a user to only have to remember a single password and then they can store all the rest of their sensitive data on the blockchain where it can never get lost and can always be retrieved provided that they remember their username and password. The key to the protocol is simplicity so that the attack surface area is as small as possible so all code should be kept to a bare minimum and be as simple as possible.

#Reference Implementation
The Scratchy app here demonstrates this using a simple scracth pad where users can type in any sensitive information that they want to encrypt and then encrypt it and post it to the blockchain using the moneybutton's OP_RETURN implementation.
Users can retrieve the data at any time by simply entering their user name and password and clicking fetch scratch pad which currently uses blockchairs API. Both the moneybutton and blockchair API's can be switched out for any other substitute without affecting the protocol.

#Security
The protocol is intentionally designed to handle all encryption client side in the browser so that no data ever leaves the browser unencrypted. Data is also never stored in cookies or local storage.
The username and password entered into the app are also never stored anywhere and must be entered each time the user uses the app.

#Encryption
Data is encrypted inside the browser using the aes-128-cbc standard.
The password used to encrypt the data is a concatenation of the users User Name and password entered into the app.
It is important therefore that the user chooses a unique username and a good password. There is no hard restriction on these though as this is up to the implementation.

#Scaling
This is the key hurdle that the protocol must overcome which is to be able to handle potentially millions of users wanting to access their data simultaneously. 
To handle this each user is issued a deterministic routing address.
This means that each time they post their data to the blockchain using OP_RETURN the transaction also sends a tiny amount of BSV to their routing address. This allows for very fast retrieval of data as the API call is to a unique address for each user and the transaction tree is small.
To be able to issue each user with a re-useable routing address without saving any sensitive information the implementation uses the old brainwallet library to generate the routing address form the hash of the users username and password.
This ensures that even if the private key of the routing address is compromised the security impact is negligeable. We can also display the private key of the routing address to the user should they ever wat to recover the few cents that have been sent their during their time using the Scratchy protocol.

#Applications
The scratchy protocol really opens up to a huge number of applications when username - password is tied to an event and stored on a microservice, anyone who knows the event ID can then submit their scratchpad unencrypted over https to the event url and the encryption is handled inside the microservice before being posted to the blockchain.

Some examples of this application follow:
1. Drivers Licence Test - Examiner shares the unique EventID for the test with the students and they complete the test via scratchpad and submit it to the url over https. 
When the test is over the username and password for the event becomes public and everyone can view all submissions.
2. Fun Scavenger hunt - Similarly to the example above, the unique event id for the scaveneger hunt is shared with the participants. The team leader can then choose the event from the dropdown list inside the scratchy app which will automatically direct the traffic to the event microservice over https. As soon as a team finds an item in the scavenger hunt they can quickly post the details to the event url proving that they found the item before other teams.
3. Silent Auction - Once again using the event microservice, attendees of a silent auction will choose the event and then begin bidding on an item that desire. The event can be set up in the microservice so that not even the organiser is allowed to view the posted data until after the auction is finished ensuring a totally blind and silent auction with no tempering.


