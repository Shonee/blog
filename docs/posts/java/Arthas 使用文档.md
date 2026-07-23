
## Arthas 使用
 [官方文档 | arthas](https://arthas.aliyun.com/doc/) 



### Java 信息查询
#### 查询类信息


#### 查询类静态变量，可查私有静态变量
 [getstatic | arthas](https://arthas.aliyun.com/doc/getstatic.html#%E4%BD%BF%E7%94%A8%E5%8F%82%E8%80%83) 

getstatic [classFullPath] [staticFieldName]
getstatic com.amap.mall.commodity.supply.platform.domain.commodity.service.aipublish.CommodityPictureDomainService DINING_INDUSTRY

- [classFullPath]: 类的全路径
- [staticFieldName]: 静态变量名称


#### 查询方法信息

### Spring 信息查询
#### 查看 springContxt 类加载器信息
 [sc | arthas](https://arthas.aliyun.com/doc/sc.html) 

sc -d org.springframework.context.ApplicationContext

因为可能存在很多个类加载器，每个classloader都有可能加载spring的ApplicationContext类，所以需要确定具体是哪个类加载器，找到其hashcode。
命令结果中的 classLoaderHash 就是对应类加载器的 hashcode。



#### 查看 spring bean 对象
 [vmtool | arthas](https://arthas.aliyun.com/doc/vmtool.html) 

vmtool --action getInstances -c [hashcode] --className org.springframework.context.ApplicationContext --express 'instances[0].getBean("switch")' -x 3

- [hashcode]: 第一步中获取的类加载器的 hashcode 
- ["switch": bean 名称


vmtool --action getInstances -c 141d3d43 --className org.springframework.context.ApplicationContext --express 'instances[0].getBean("odpsKeyCenterComponent")' -x 3



#### 调用 bean 方法
vmtool --action getInstances -c [hashcode] --className org.springframework.context.ApplicationContext --express 'instances[0].getBean("ipNotifySwitch2ReservePriceSyncItemConfig").contains(11111L)' -x 3

- [hashcode]: 第一步中获取的类加载器的 hashcode 
- "switch": bean 名称
- .contains(11111L): bean方法和传入参数


vmtool --action getInstances -c 141d3d43 --className org.springframework.context.ApplicationContext --express 'instances[0].getBean("odpsKeyCenterComponent").decrypt("zo6p1ID8dQYSlBQj45IOaFfn0yv/VUpDaaJrlRdgGZ0=")' -x 3


#### 使用 ognl 命令查看 spring bean 信息（基于 SpringContextUtils）
 [ognl | arthas](https://arthas.aliyun.com/doc/ognl.html) 

ognl '@your.util.ApplicationUtil@getApplicationContext().getBean("beanName")'
ognl '@your.util.ApplicationUtil@getApplicationContext().getBean("beanName").propertyName'
ognl 'your.util.ApplicationUtil.getApplicationContext().getBean("beanName").someMethod()'

ognl -c 7357a011 '#context=@com.***.SpringContextHolder@applicationContext,#context.getBean("controller").env'

- @your.util.ApplicationUtil@getApplicationContext()：代码中定义的 SpringContextUtils 静态工具类
- [beanName]: bean 名称
- [propertyName]: bean 属性名称
- someMethod(): bean 方法名称


ognl 'com.amap.mall.commodity.supply.platform.common.utils.AppContextUtil.getBean("odpsKeyCenterComponent")'
ognl -c 16a35bd '#context=@com.amap.mall.commodity.supply.platform.common.utils.AppContextUtil@applicationContext,#context.getBean("odpsKeyCenterComponent").decrypt("zo6p1ID8dQYSlBQj45IOaFfn0yv/VUpDaaJrlRdgGZ0=)'

