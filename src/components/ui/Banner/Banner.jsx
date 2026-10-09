import { cn } from '../../../utils/cn.js'
import Icon from '../Icon/Icon.jsx'
import Text from '../Text/Text.jsx'
import styles from './Banner.module.css'

/**
 * Banner de M3: un mensaje importante y persistente, con una acción opcional.
 *   <Banner icon="info" action={<Button variant="text">Ingresar</Button>}>Estás en modo demo.</Banner>
 */
export default function Banner({ icon = 'info', action, children, className }) {
  return (
    <div className={cn(styles.banner, className)} role="note">
      <Icon name={icon} className={styles.icon} />
      <Text as="p" variant="body-medium" className={styles.text}>
        {children}
      </Text>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
