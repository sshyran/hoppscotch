import gql from "graphql-tag"

async function createTeam(apollo, name) {
  return apollo.mutate({
    mutation: gql`
      mutation($name: String!) {
        createTeam(name: $name) {
          name
        }
      }
    `,
    variables: {
      name: name,
    },
  })
}

async function addTeamMemberByEmail(apollo, userRole, userEmail, teamID) {
  return apollo.mutate({
    mutation: gql`
      mutation addTeamMemberByEmail(
        $userRole: TeamMemberRole!
        $userEmail: String!
        $teamID: String!
      ) {
        addTeamMemberByEmail(userRole: $userRole, userEmail: $userEmail, teamID: $teamID) {
          role
        }
      }
    `,
    variables: {
      userRole: userRole,
      userEmail: userEmail,
      teamID: teamID,
    },
  })
}

async function renameTeam(apollo, name, teamID) {
  return apollo.mutate({
    mutation: gql`
      mutation renameTeam($newName: String!, $teamID: String!) {
        renameTeam(newName: $newName, teamID: $teamID) {
          id
        }
      }
    `,
    variables: {
      newName: name,
      teamID: teamID,
    },
  })
}

async function deleteTeam(apollo, teamID) {
  let response = undefined
  while (true) {
    response = await apollo.mutate({
      mutation: gql`
        mutation($teamID: String!) {
          deleteTeam(teamID: $teamID)
        }
      `,
      variables: {
        teamID: teamID,
      },
    })
    if (response != undefined) break
  }
  return response
}

async function exitTeam(apollo, teamID) {
  apollo.mutate({
    mutation: gql`
      mutation($teamID: String!) {
        leaveTeam(teamID: $teamID)
      }
    `,
    variables: {
      teamID: teamID,
    },
  })
}

async function rootCollectionsOfTeam(apollo, teamID) {
  var collections = []
  var cursor = ""
  while (true) {
    var response = await apollo.query({
      query: gql`
        query rootCollectionsOfTeam($teamID: String!, $cursor: String!) {
          rootCollectionsOfTeam(teamID: $teamID, cursor: $cursor) {
            id
            title
          }
        }
      `,
      variables: {
        teamID: teamID,
        cursor: cursor,
      },
      fetchPolicy: "no-cache",
    })
    if (response.data.rootCollectionsOfTeam.length == 0) break
    response.data.rootCollectionsOfTeam.forEach((collection) => {
      collections.push(collection)
    })
    cursor = collections[collections.length - 1].id
  }
  return collections
}

async function getCollectionChildren(apollo, collectionID) {
  var children = []
  var response = await apollo.query({
    query: gql`
      query getCollectionChildren($collectionID: String!) {
        collection(collectionID: $collectionID) {
          children {
            id
            title
          }
        }
      }
    `,
    variables: {
      collectionID: collectionID,
    },
    fetchPolicy: "no-cache",
  })
  response.data.collection.children.forEach((child) => {
    children.push(child)
  })
  return children
}

async function getCollectionRequests(apollo, collectionID) {
  var requests = []
  var cursor = ""
  while (true) {
    var response = await apollo.query({
      query: gql`
        query getCollectionRequests($collectionID: String!, $cursor: String) {
          requestsInCollection(collectionID: $collectionID, cursor: $cursor) {
            id
            title
            request
          }
        }
      `,
      variables: {
        collectionID: collectionID,
        cursor: cursor,
      },
      fetchPolicy: "no-cache",
    })

    response.data.requestsInCollection.forEach((request) => {
      requests.push(request)
    })

    if (response.data.requestsInCollection.length < 10) {
      break
    }
    cursor = requests[requests.length - 1].id
  }
  return requests
}

async function renameCollection(apollo, title, id) {
  let response = undefined
  while (true) {
    response = await apollo.mutate({
      mutation: gql`
        mutation($newTitle: String!, $collectionID: String!) {
          renameCollection(newTitle: $newTitle, collectionID: $collectionID) {
            id
          }
        }
      `,
      variables: {
        newTitle: title,
        collectionID: id,
      },
    })
    if (response != undefined) break
  }
  return response
}

async function addChildCollection(apollo, title, id) {
  let response = undefined
  while (true) {
    response = await apollo.mutate({
      mutation: gql`
        mutation($childTitle: String!, $collectionID: String!) {
          createChildCollection(childTitle: $childTitle, collectionID: $collectionID) {
            id
          }
        }
      `,
      variables: {
        childTitle: title,
        collectionID: id,
      },
    })
    if (response != undefined) break
  }
  return response
}

async function deleteCollection(apollo, id) {
  let response = undefined
  while (true) {
    response = await apollo.mutate({
      mutation: gql`
        mutation($collectionID: String!) {
          deleteCollection(collectionID: $collectionID)
        }
      `,
      variables: {
        collectionID: id,
      },
    })
    if (response != undefined) break
  }
  return response
}

async function createNewRootCollection(apollo, title, id) {
  let response = undefined
  while (true) {
    response = await apollo.mutate({
      mutation: gql`
        mutation($title: String!, $teamID: String!) {
          createRootCollection(title: $title, teamID: $teamID) {
            id
          }
        }
      `,
      variables: {
        title: title,
        teamID: id,
      },
    })
    if (response != undefined) break
  }
  return response
}

async function saveRequestAsTeams(apollo, request, title, teamID, collectionID) {
  await apollo.mutate({
    mutation: gql`
      mutation($data: CreateTeamRequestInput!, $collectionID: String!) {
        createRequestInCollection(data: $data, collectionID: $collectionID) {
          collection {
            id
            team {
              id
              name
            }
          }
        }
      }
    `,
    variables: {
      collectionID: collectionID,
      data: {
        teamID: teamID,
        title: title,
        request: request,
      },
    },
  })
}

export default {
  rootCollectionsOfTeam: rootCollectionsOfTeam,
  getCollectionChildren: getCollectionChildren,
  getCollectionRequests: getCollectionRequests,
  saveRequestAsTeams: saveRequestAsTeams,
  renameCollection: renameCollection,
  addChildCollection: addChildCollection,
  deleteCollection: deleteCollection,
  createNewRootCollection: createNewRootCollection,
  createTeam: createTeam,
  addTeamMemberByEmail: addTeamMemberByEmail,
  renameTeam: renameTeam,
  deleteTeam: deleteTeam,
  exitTeam: exitTeam,
}