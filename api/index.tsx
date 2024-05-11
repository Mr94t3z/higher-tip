import { Button, Frog} from 'frog'
import { handle } from 'frog/vercel'
import { Box, Heading, Text, VStack, Spacer, vars } from "../lib/ui.js";
import { abi } from "../lib/higherAbi.js";
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
                    Higher Tipping 
                </Heading>
                <Spacer size="16" />
                <Text align="center" color="grey" size="16">
                    a cast action to tip $higher.
                </Text>
                <Spacer size="22" />
                <Box flexDirection="row" justifyContent="center">
                    <Text color="white" align="center" size="14">created by</Text>
                    <Spacer size="10" />
                    <Text color="grey" decoration="underline" align="center" size="14"> @0x94t3z</Text>
                </Box>
            </VStack>
        </Box>
    ),
    intents: [
      <Button.AddCastAction action="/higher-tip">
        Add "Higher Tipping" Action
      </Button.AddCastAction>,
    ]
  })
})
 
app.castAction(
  '/higher-tip',
  (c) => {
    // Stringify the entire castId object
    const castId = JSON.stringify(c.actionData.castId);

    // Parse the message back to an object to extract fid
    const parsedCastId = JSON.parse(castId);
    const castFid = parsedCastId.fid;
    const fromFid = c.actionData.fid;

    return c.frame({ path: `/higher-tip-frame/${castFid}/from/${fromFid}`})
  }, 
  { name: "Higher Tipping ↑", icon: "zap" }
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
                      <Text color="grey" decoration="underline" align="center" size="14"> @0x94t3z</Text>
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
  
    const eth_address = userData.verified_addresses.eth_addresses.toString().toLowerCase().split(',')[0];

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
            <Heading color="white" decoration="underline" weight="900" align="center" size="32">
            ↑ Higher Tipping ↑
            </Heading>
            <Spacer size="16" />
            <Text align="center" color="grey" size="18">
              Send 1 $higher to @{username}?
            </Text>
            <Spacer size="22" />
              <Box flexDirection="row" justifyContent="center">
                  <Text color="white" align="center" size="14">created by</Text>
                  <Spacer size="10" />
                  <Text color="grey" decoration="underline" align="center" size="14"> @0x94t3z</Text>
                </Box>
          </VStack>
        </Box>
      ),
      intents: [
        <Button.Transaction target={`/transfer/${eth_address}`}>Tip @{username}</Button.Transaction>,
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
                <Heading color="white" decoration="underline" weight="900" align="center" size="32">
                    Error
                </Heading>
                <Spacer size="16" />
                <Text align="center" color="grey" size="16">
                    Uh oh, something went wrong. Try again.
                </Text>
                <Spacer size="22" />
                <Box flexDirection="row" justifyContent="center">
                    <Text color="white" align="center" size="14">created by</Text>
                    <Spacer size="10" />
                    <Text color="grey" decoration="underline" align="center" size="14"> @0x94t3z</Text>
                </Box>
            </VStack>
        </Box>
    ),
  });
}
})


app.transaction('/transfer/:eth_address', async (c, next) => {
  await next();
  const txParams = await c.res.json();
  txParams.attribution = false;
  console.log(txParams);
  c.res = new Response(JSON.stringify(txParams), {
    headers: {
      "Content-Type": "application/json",
    },
  });
},
async (c) => { 
    const {eth_address} = c.req.param();

    const contractAddress = process.env.HIGHER_SMART_CONTRACT_ADDRESS;
    // Send transaction response. 
    return c.contract({ 
      abi: abi,
      chainId: 'eip155:8453',
      functionName: 'transfer',
      args: [eth_address as `0x${string}`, 1n],
      to: contractAddress as `0x${string}`,
    }) 
  }
) 

export const GET = handle(app)
export const POST = handle(app)
