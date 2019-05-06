# Scratchy
Scratchy is a pure client side protocol for encrypting, storing and retrieving data on the BSV blockchain at scale.
<img  style="float: right;" src="https://www.catship.co.za/scratchy/content/UITeaser.png" width="250">

You can test the app here (best on mobile): https://catship.co.za/scratchy/scratchy.html

## Overview
The key purpose of the protocol is that it allows a user to only have to remember a single password / passphrase and then they can store sensitive data on the blockchain where it can never get lost and can always be retrieved provided that they remember their username and password / passphrase. The key to the protocol is simplicity so that the attack surface area is as small as possible so all code should be kept to a bare minimum and be as simple as possible.

## Applications
The scratchy protocol opens up to a potentially endless number of applications. There are two main modes to it, the first called "local mode" is when all the encryption happens in the users web client and the second is called "event mode" where the creator of an event sends the username and password to the event service and all encryption is handled by the service. 
In this mode any user can select the event can then send their scratchpad to the event service and the encryption is handled inside the microservice before being posted to the blockchain.

Some examples of potential applications are as follows:
1. Two friends wish to have a serverless secure messenging app to be able to communicate, they choose a single shared username and password and then are able to send and retrieve messages to each other using the scratchy app. (local mode)
2. Drivers Licence Test - Examiner shares the unique EventID for the test with the students and they select the event from the drop down list. Once each student completes the test via scratchpad they submit it. 
When the test is over the username and password for the event becomes public and everyone can view all the various submissions ensuring that the marking is fair and just. (event mode)
3. Fun Scavenger hunt - Similarly to the example above, the unique event id for the scaveneger hunt is shared with the participants. The team leader can then choose the event from the dropdown list inside the scratchy app which will automatically direct the traffic to the event microservice over https. As soon as a team finds an item in the scavenger hunt they can quickly post the details proving that they found the item before other teams. (event mode)
4. Silent Auction - Once again using the event API, attendees of a silent auction will choose the event and then begin bidding on an item that they desire. The event can be set up in the microservice so that not even the organiser is allowed to view the posted data until after the auction is finished ensuring a totally blind and silent auction is carried out with no tampering.(event mode)
5. An inventor wants to copywrite an idea that he/she has come up with but they do not want to share the idea publicly yet. By using the scratchy app to quickly jot down the idea and send it to the blockchain encrypted they can ensure that they can prove that they owned the art at the time of posting. (local mode)
6. A tech fundi is tired of having to remember all of their passwords to all the different apps and sites they have, they can just remember a single strong password and save all the rest of their passwords using the scratchy app. (local mode)

## Reference Implementation
The Scratchy app here demonstrates this using a simple scratch pad where users can type in / paste any info that they want to encrypt and post to the blockchain using the moneybutton's OP_RETURN implementation.
Users can retrieve the data at any time by simply entering their user name and password / passphrase and clicking fetch button which currently uses blockchairs API to retrieve the data and bico.media API to unbundle the payload. All the moneybutton, bico.media and blockchair API's can be switched out for any other substitute without affecting the protocol.
The app also periodically fetches the event data from the event API which has an end date in the future and users can use the drop down list to select an event and use the app in event mode.
The user can also click the create new event button which allows them to create a new event and send it to the event API for others to use.

## Security
The protocol is intentionally designed to handle all encryption client side in the browser so that no data ever leaves the browser unencrypted. Data is also never stored in cookies or local storage.
The username and password entered into the app are also never stored anywhere and must be entered each time the user uses the app.
** It is vital that the users of the app know that the protocol is only as strong as their password / passphrase so weak passwords would be trivial to hack. **
When the encryption is handled inside the API then the data is sent to the API over HTTPS, encrypted there and then returned. The passwords stored in the API database are never exposed.

## Encryption
Data is encrypted inside the browser using the aes-128-cbc standard.
The password is used to encrypt the data in the scratchpad.
The user name is used to calculate the deterministic routing address to enable each user to have their own collection of scratch pads.
It is important therefore that the user chooses a unique username and a good password. The password should ideally have more than 128 bits of entropy so a bitcoin random 12 word mnemonic would suffice. 

## Scaling
This is the key hurdle that the protocol must overcome which is to be able to handle potentially millions of users wanting to access their data simultaneously. 
To handle this each user is issued a deterministic routing address.
This means that each time they post their data to the blockchain using OP_RETURN the transaction also sends a tiny amount of BSV to their routing address. This allows for very fast retrieval of data as the API call is to a unique address for each user and the transaction tree is narrow.
To be able to issue each user with a re-useable routing address without saving any sensitive information the implementation uses the legacy brainwallet library to generate the routing address form the users username.
The fact that brainwalllet is deprecated as a wallet due to security concerns does not mean it does not serve our purposes well here. The routing wallet only ever contains dust so just likee the users username is not intended to be confidential. We can also display the private key of the routing address to the user should they ever want to recover their dust, what is dust today might be grocery money one day in the future! 

## Event Service API
The event service API is a restfull API that acts as a service to allow srcatchpad users to create and take part in events. 
The API is able to perform 6 main functions:
1. It allows scratchy users to POST new events.
2. It allows scratchy users to GET current events (without the event password) into the events drop down menu provided that the current date is between the event start and event end date.
3. The owner of an event can update an event start and end date by sending through a PUT command with the new dates.
4. The owner of an event can delete an event if it has not already started.
5. the API is able to accept a users unencrypted scratchpad via POST and then encrypt it and store it in it's database.  
6. It allows a user to GET back their encrypted scratchpad from it's database.

HAPPY SCRATCHING!!



