import { Button, Frog} from 'frog'
import { handle } from 'frog/vercel'
import { Box, Heading, Text, VStack, Spacer, vars } from "../lib/ui.js";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const ACTION_URL =
  "https://warpcast.com/~/add-cast-action?url=https://higher-tip.vercel.app/api/higher-tip";

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  ui: { vars },
  browserLocation: ACTION_URL,
});

const baseUrlNeynarV2 = process.env.BASE_URL_NEYNAR_V2;
 
app.frame('/', (c) => {
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Add "Higher Tipping" Action
      </div>
    ),
    intents: [
      <Button.AddCastAction action="/higher-tip">
        Add
      </Button.AddCastAction>,
    ]
  })
})
 
app.castAction(
  '/higher-tip',
  (c) => {
    console.log(
      `Cast Action to ${JSON.stringify(c.actionData.castId)} from ${
        c.actionData.fid
      }`,
    )
    // Stringify the entire castId object
    const castId = JSON.stringify(c.actionData.castId);

    // Parse the message back to an object to extract fid
    const parsedCastId = JSON.parse(castId);
    const castFid = parsedCastId.fid;
    const fromFid = c.actionData.fid;

    return c.frame({ path: `/higher-tip-frame/${castFid}/from/${fromFid}`})
  }, 
  { name: "Higher tipping", icon: "zap" }
)

app.frame('/higher-tip-frame/:castFid/from/:fromFid', async (c) => {
  const {castFid, fromFid} = c.req.param();

  if (fromFid === castFid) {
    return c.res({
      image: (
          <Box
              grow
              alignVertical="center"
              backgroundColor="bg"
              padding="48"
              textAlign="center"
              height="100%"
          >
              <VStack gap="4">
                  <Heading color="white" decoration="underline" weight="900" align="center" size="32">
                      Error
                  </Heading>
                  <Spacer size="16" />
                  <Text align="center" color="grey" size="16">
                      Nice try, you can't tip yourself.
                  </Text>
                  <Spacer size="22" />
                  <Box flexDirection="row" justifyContent="center">
                      <Text color="white" align="center" size="14">created by</Text>
                      <Spacer size="10" />
                      <Text color="fcPurple" decoration="underline" align="center" size="14"> @0x94t3z</Text>
                  </Box>
              </VStack>
          </Box>
      ),
  });
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${castFid}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'api_key': process.env.NEYNAR_API_KEY || '',
        },
    });

    const userFarcasterData = await response.json();
    const userData = userFarcasterData.users[0];

    const username = userData.username;
  
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase().split(',')[0];

    return c.res({
      action: '/tx-status',
      image: (
        <Box
          grow
          alignVertical="center"
          backgroundColor="bg"
          padding="48"
          textAlign="center"
          height="100%"
        >
          <VStack gap="4">
            <Heading color="fcPurple" decoration="underline" weight="900" align="center" size="32">
              DP Rewards Checker
            </Heading>
            <Spacer size="16" />
            <Text align="center" color="white" size="18">
              Send 1 $higher to {username}
            </Text>
            <Spacer size="22" />
              <Box flexDirection="row" justifyContent="center">
                  <Text color="black" align="center" size="14">created by</Text>
                  <Spacer size="10" />
                  <Text color="fcPurple" decoration="underline" align="center" size="14"> @0x94t3z</Text>
                </Box>
          </VStack>
        </Box>
      ),
      intents: [
        <Button action="/result">Tip</Button>,
      ],
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return c.res({
      image: (
        <Box
            grow
            alignVertical="center"
            backgroundColor="bg"
            padding="48"
            textAlign="center"
            height="100%"
        >
            <VStack gap="4">
                <Heading color="fcPurple" decoration="underline" weight="900" align="center" size="32">
                    Error
                </Heading>
                <Spacer size="16" />
                <Text align="center" color="red" size="16">
                    Uh oh, something went wrong. Try again.
                </Text>
                <Spacer size="22" />
                <Box flexDirection="row" justifyContent="center">
                    <Text color="black" align="center" size="14">created by</Text>
                    <Spacer size="10" />
                    <Text color="fcPurple" decoration="underline" align="center" size="14"> @0x94t3z</Text>
                </Box>
            </VStack>
        </Box>
    ),
  });
}
})

export const GET = handle(app)
export const POST = handle(app)
