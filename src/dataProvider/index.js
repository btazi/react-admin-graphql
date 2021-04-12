import buildApolloClient, {
  buildQuery as buildQueryFactory
} from "ra-data-graphql-simple";
import { DELETE } from "ra-core";
import gql from "graphql-tag";
const getGqlResource = resource => {
  switch (resource) {
    case "customers":
      return "Customer";

    case "categories":
      return "Category";

    case "commands":
      return "Command";

    case "products":
      return "Product";

    case "reviews":
      return "Review";

    case "invoices":
      return "Invoice";

    default:
      throw new Error(`Unknown resource ${resource}`);
  }
};

const customBuildQuery = introspectionResults => {
  const buildQuery = buildQueryFactory(introspectionResults);

  return (type, resource, params) => {
    const builtQuery = buildQuery(type, resource, params);
    if (type === "GET_LIST" && resource === "Customer") {
      return {
        ...builtQuery,
        query: gql`
          query allCustomers(
            $page: Int
            $perPage: Int
            $sortField: String
            $sortOrder: String
          ) {
            items: allCustomers(
              page: $page
              perPage: $perPage
              sortField: $sortField
              sortOrder: $sortOrder
            ) {
              address
              avatar
              birthday
              city
              mail: email
              first_name
              first_seen
              groups
              has_newsletter
              has_ordered
              id
              last_name
              last_seen
              latest_purchase
              nb_commands
              total_spent
              zipcode
            }

            total: _allCustomersMeta(page: $page, perPage: $perPage) {
              count
              __typename
            }
          }
        `
      };
    }
    if (type === DELETE) {
      return {
        query: gql`mutation remove${resource}($id: ID!) {
                    remove${resource}(id: $id)
                }`,
        variables: { id: params.id },
        parseResponse: ({ data }) => {
          if (data[`remove${resource}`]) {
            return { data: { id: params.id } };
          }

          throw new Error(`Could not delete ${resource}`);
        }
      };
    }

    return builtQuery;
  };
};

export default () => {
  return buildApolloClient({
    clientOptions: {
      uri: "http://localhost:4000/graphql"
    },
    introspection: {
      operationNames: {
        [DELETE]: resource => `remove${resource.name}`
      }
    },
    buildQuery: customBuildQuery
  }).then(dataProvider => (type, resource, params) =>
    dataProvider(type, getGqlResource(resource), params)
  );
};
