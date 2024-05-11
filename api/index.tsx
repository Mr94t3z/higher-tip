import { Button, Frog} from 'frog'
import { handle } from 'frog/vercel'

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

 
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
    return c.frame({ path: '/higher-tip-frame' })
  }, 
  { name: "Higher tipping", icon: "zap" }
)

app.frame('/higher-tip-frame', (c) => {
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Execute "Higher Tipping" Action!
      </div>
    )
  })
})

export const GET = handle(app)
export const POST = handle(app)